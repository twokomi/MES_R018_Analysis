import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// 업로드 진행 상황 추적 (메모리)
const uploadProgress = new Map<string, {
  current: number;
  total: number;
  startTime: number;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}>();

// CORS 설정
app.use('/api/*', cors())

// API: 엑셀 데이터 저장 (백그라운드)
app.post('/api/upload', async (c) => {
  try {
    const { env } = c
    const body = await c.req.json()
    
    const { filename, fileSize, rawData, processedData, processMapping, shiftCalendar } = body
    
    console.log('Received upload request:', {
      filename,
      fileSize,
      processedDataCount: processedData?.length,
      processMappingCount: processMapping?.length,
      shiftCalendarCount: shiftCalendar?.length
    })
    
    // 업로드 기록 생성 (진행 상태 포함)
    const uploadResult = await env.DB.prepare(`
      INSERT INTO excel_uploads (filename, file_size, total_records, unique_workers, date_range_start, date_range_end, upload_status, progress_current, progress_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      filename,
      fileSize,
      processedData?.length || 0,
      new Set(processedData?.map((d: any) => d.workerName)).size || 0,
      processedData?.[0]?.workingDay || null,
      processedData?.[processedData.length - 1]?.workingDay || null,
      'processing',
      0,
      processedData?.length || 0
    ).run()
    
    const uploadId = uploadResult.meta.last_row_id as number
    
    // 진행 상황 초기화
    uploadProgress.set(uploadId.toString(), {
      current: 0,
      total: processedData?.length || 0,
      startTime: Date.now(),
      status: 'processing'
    })
    
    // 🚀 즉시 응답 반환 (백그라운드 처리)
    // 실제 데이터 저장은 비동기로 진행
    // CRITICAL: Cloudflare Workers requires waitUntil() for background tasks
    c.executionCtx.waitUntil((async () => {
      try {
        // Raw 데이터 저장 (processedData 사용)
        if (processedData && processedData.length > 0) {
          // D1 Batch API를 사용하여 효율적으로 저장 (최대 50개씩)
          const batchSize = 50
          
          console.log(`💾 Background insert started: ${processedData.length} records, ${Math.ceil(processedData.length / batchSize)} batches`)
          
          for (let i = 0; i < processedData.length; i += batchSize) {
            const batch = processedData.slice(i, i + batchSize)
            
            // D1 Batch API: 여러 쿼리를 하나의 트랜잭션으로 실행
            const statements = batch.map((record: any) => {
              const foDescValue = record.foDesc2 || record.foDesc || ''
              const workerST = record['Worker S/T'] || 0
              const workerRatePct = record['Worker Rate(%)'] || 0
              
              return env.DB.prepare(`
                INSERT INTO raw_data (upload_id, worker_name, fo_desc, fd_desc, start_datetime, end_datetime, worker_act, result_cnt, working_day, working_shift, actual_shift, work_rate, worker_st, worker_rate_pct)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `).bind(
                uploadId,
                record.workerName || '',
                foDescValue,
                record.fdDesc || '',
                record.startDatetime || '',
                record.endDatetime || '',
                record.workerActMins || record.workerAct || 0,
                record.resultCnt || '',
                record.workingDay || '',
                record.workingShift || '',
                record.actualShift || '',
                record.workRate || 0,
                workerST,
                workerRatePct
              )
            })
            
            // D1 batch() 실행
            await env.DB.batch(statements)
            
            // 진행 상황 업데이트 (DB에 저장)
            await env.DB.prepare(`
              UPDATE excel_uploads 
              SET progress_current = ?
              WHERE id = ?
            `).bind(i + batch.length, uploadId).run()
            
            // 메모리 Map도 업데이트 (optional, for legacy support)
            const progress = uploadProgress.get(uploadId.toString())
            if (progress) {
              progress.current = i + batch.length
            }
            
            if ((i / batchSize) % 20 === 0) {
              console.log(`  📊 Progress: ${i + batch.length} / ${processedData.length} records`)
            }
          }
        }
        
        // 공정 매핑 저장
        if (processMapping && processMapping.length > 0) {
          for (const mapping of processMapping) {
            await env.DB.prepare(`
              INSERT INTO process_mapping (upload_id, fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(
              uploadId,
              mapping.fdDesc || null,
              mapping.foDesc || mapping.fdDesc || null,
              mapping.foDesc2 || null,
              mapping.foDesc3 || null,
              mapping.seq || null
            ).run()
          }
        }
        
        // Shift Calendar 저장
        if (shiftCalendar && shiftCalendar.length > 0) {
          for (const shift of shiftCalendar) {
            await env.DB.prepare(`
              INSERT INTO shift_calendar (upload_id, date, day_shift, night_shift)
              VALUES (?, ?, ?, ?)
            `).bind(
              uploadId,
              shift.date || null,
              shift.dayShift || null,
              shift.nightShift || null
            ).run()
          }
        }
        
        // 완료 처리 (DB에 저장)
        await env.DB.prepare(`
          UPDATE excel_uploads 
          SET upload_status = 'completed', progress_current = progress_total
          WHERE id = ?
        `).bind(uploadId).run()
        
        // 메모리 Map도 업데이트 (optional)
        const progress = uploadProgress.get(uploadId.toString())
        if (progress) {
          progress.status = 'completed'
        }
        console.log(`✅ Background insert completed: ${processedData?.length || 0} records`)
        
      } catch (error: any) {
        console.error('Background upload error:', error)
        const progress = uploadProgress.get(uploadId.toString())
        if (progress) {
          progress.status = 'error'
          progress.error = error.message
        }
      }
    })())
    
    return c.json({ 
      success: true, 
      uploadId,
      message: 'Upload started in background',
      totalRecords: processedData?.length || 0
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 업로드 진행 상황 조회 (DB에서 읽기)
app.get('/api/upload-progress/:id', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    
    // DB에서 업로드 정보 조회
    const result = await env.DB.prepare(`
      SELECT upload_status, progress_current, progress_total, upload_date, error_message
      FROM excel_uploads
      WHERE id = ?
    `).bind(uploadId).first()
    
    if (!result) {
      return c.json({ 
        success: false, 
        status: 'not_found',
        message: 'Upload not found' 
      }, 404)
    }
    
    const elapsed = Math.floor((Date.now() - new Date(result.upload_date as string).getTime()) / 1000)
    const percentage = (result.progress_total as number) > 0 
      ? Math.round(((result.progress_current as number) / (result.progress_total as number)) * 100) 
      : 0
    
    return c.json({
      success: true,
      uploadId,
      status: result.upload_status,
      current: result.progress_current,
      total: result.progress_total,
      percentage,
      elapsed,
      error: result.error_message
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 업로드 목록 조회
app.get('/api/uploads', async (c) => {
  try {
    const { env } = c
    
    // Check if DB is available (local dev without D1 binding)
    if (!env.DB) {
      console.log('DB binding not available, returning empty uploads list')
      return c.json({ 
        success: true, 
        uploads: [],
        message: 'Database not available in local development mode. Use Excel upload instead.'
      })
    }
    
    const { results } = await env.DB.prepare(`
      SELECT id, filename, upload_date, file_size, total_records, unique_workers, date_range_start, date_range_end
      FROM excel_uploads
      ORDER BY upload_date DESC
      LIMIT 50
    `).all()
    
    return c.json({ success: true, uploads: results || [] })
  } catch (error: any) {
    console.error('Error fetching uploads:', error)
    // Return empty array instead of 500 error
    return c.json({ 
      success: true,
      uploads: [],
      error: error.message,
      message: 'Database error. Please use Excel file upload instead.'
    })
  }
})

// API: 특정 업로드 데이터 조회 (메타데이터만, raw_data 제외)
app.get('/api/uploads/:id', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    
    // 업로드 정보
    const upload = await env.DB.prepare(`
      SELECT * FROM excel_uploads WHERE id = ?
    `).bind(uploadId).first()
    
    if (!upload) {
      return c.json({ success: false, error: 'Upload not found' }, 404)
    }
    
    // 공정 매핑
    const { results: processMapping } = await env.DB.prepare(`
      SELECT * FROM process_mapping WHERE upload_id = ?
    `).bind(uploadId).all()
    
    // Shift Calendar
    const { results: shiftCalendar } = await env.DB.prepare(`
      SELECT * FROM shift_calendar WHERE upload_id = ?
    `).bind(uploadId).all()
    
    return c.json({
      success: true,
      upload,
      rawData: [], // 빈 배열로 반환 (별도 API로 요청)
      processMapping,
      shiftCalendar
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 특정 업로드의 raw_data를 페이지네이션으로 조회
app.get('/api/uploads/:id/raw-data', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '1000')
    const offset = (page - 1) * limit
    
    console.log(`📄 Loading raw_data for upload #${uploadId}, page ${page}, limit ${limit}`)
    
    // 전체 레코드 수
    const countResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM raw_data WHERE upload_id = ?
    `).bind(uploadId).first()
    
    // 페이지네이션된 데이터
    const { results: rawData } = await env.DB.prepare(`
      SELECT * FROM raw_data WHERE upload_id = ? LIMIT ? OFFSET ?
    `).bind(uploadId, limit, offset).all()
    
    const total = countResult?.total || 0
    const totalPages = Math.ceil(total / limit)
    
    console.log(`✅ Loaded ${rawData.length} records (page ${page}/${totalPages})`)
    
    return c.json({
      success: true,
      rawData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages
      }
    })
  } catch (error: any) {
    console.error('Raw data load error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 업로드 삭제
app.delete('/api/uploads/:id', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    
    // 업로드 정보 확인
    const upload = await env.DB.prepare(`
      SELECT * FROM excel_uploads WHERE id = ?
    `).bind(uploadId).first()
    
    if (!upload) {
      return c.json({ success: false, error: 'Upload not found' }, 404)
    }
    
    // 관련 데이터 삭제 (순서 중요: 외래 키 제약 고려)
    // 1. raw_data 삭제
    const rawDataResult = await env.DB.prepare(`
      DELETE FROM raw_data WHERE upload_id = ?
    `).bind(uploadId).run()
    
    // 2. process_mapping 삭제
    const mappingResult = await env.DB.prepare(`
      DELETE FROM process_mapping WHERE upload_id = ?
    `).bind(uploadId).run()
    
    // 3. shift_calendar 삭제
    const calendarResult = await env.DB.prepare(`
      DELETE FROM shift_calendar WHERE upload_id = ?
    `).bind(uploadId).run()
    
    // 4. excel_uploads 삭제
    const uploadResult = await env.DB.prepare(`
      DELETE FROM excel_uploads WHERE id = ?
    `).bind(uploadId).run()
    
    return c.json({
      success: true,
      message: `Deleted upload #${uploadId}: ${upload.filename}`,
      deleted: {
        rawData: rawDataResult.meta.changes,
        processMapping: mappingResult.meta.changes,
        shiftCalendar: calendarResult.meta.changes,
        upload: uploadResult.meta.changes
      }
    })
  } catch (error: any) {
    console.error('Delete error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: Process Mapping 조회 (특정 업로드)
app.get('/api/uploads/:id/process-mapping', async (c) => {
  try {
    const { env } = c
    const uploadId = c.req.param('id')
    
    const { results: mappings } = await env.DB.prepare(`
      SELECT * FROM process_mapping 
      WHERE upload_id = ? 
      ORDER BY fo_desc_2, seq
    `).bind(uploadId).all()
    
    return c.json({
      success: true,
      mappings
    })
  } catch (error: any) {
    console.error('Process mapping load error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 모든 Process Mapping 조회 (최신 업로드 기준)
app.get('/api/process-mapping', async (c) => {
  try {
    const { env } = c
    
    // 최신 업로드 ID 가져오기
    const latestUpload = await env.DB.prepare(`
      SELECT id FROM excel_uploads 
      ORDER BY upload_date DESC 
      LIMIT 1
    `).first()
    
    if (!latestUpload) {
      return c.json({
        success: true,
        mappings: [],
        message: 'No uploads found'
      })
    }
    
    const { results: mappings } = await env.DB.prepare(`
      SELECT * FROM process_mapping 
      WHERE upload_id = ? 
      ORDER BY fo_desc_2, seq
    `).bind(latestUpload.id).all()
    
    return c.json({
      success: true,
      uploadId: latestUpload.id,
      mappings
    })
  } catch (error: any) {
    console.error('Process mapping load error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: Process Mapping 추가/수정
app.post('/api/process-mapping', async (c) => {
  try {
    const { env } = c
    const { uploadId, fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq } = await c.req.json()
    
    // 기존 매핑 확인
    const existing = await env.DB.prepare(`
      SELECT id FROM process_mapping 
      WHERE upload_id = ? AND fd_desc = ? AND fo_desc = ?
    `).bind(uploadId, fd_desc, fo_desc).first()
    
    if (existing) {
      // 수정
      await env.DB.prepare(`
        UPDATE process_mapping 
        SET fo_desc_2 = ?, fo_desc_3 = ?, seq = ?
        WHERE id = ?
      `).bind(fo_desc_2, fo_desc_3, seq, existing.id).run()
      
      return c.json({
        success: true,
        message: 'Mapping updated',
        id: existing.id
      })
    } else {
      // 추가
      const result = await env.DB.prepare(`
        INSERT INTO process_mapping (upload_id, fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(uploadId, fd_desc, fo_desc, fo_desc_2, fo_desc_3, seq).run()
      
      return c.json({
        success: true,
        message: 'Mapping added',
        id: result.meta.last_row_id
      })
    }
  } catch (error: any) {
    console.error('Process mapping save error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: Process Mapping 삭제
app.delete('/api/process-mapping/:id', async (c) => {
  try {
    const { env } = c
    const mappingId = c.req.param('id')
    
    await env.DB.prepare(`
      DELETE FROM process_mapping WHERE id = ?
    `).bind(mappingId).run()
    
    return c.json({
      success: true,
      message: 'Mapping deleted'
    })
  } catch (error: any) {
    console.error('Process mapping delete error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
