import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// API: 엑셀 데이터 저장
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
    
    // 업로드 기록 생성
    const uploadResult = await env.DB.prepare(`
      INSERT INTO excel_uploads (filename, file_size, total_records, unique_workers, date_range_start, date_range_end)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      filename,
      fileSize,
      processedData?.length || 0,
      new Set(processedData?.map((d: any) => d.workerName)).size || 0,
      processedData?.[0]?.workingDay || null,
      processedData?.[processedData.length - 1]?.workingDay || null
    ).run()
    
    const uploadId = uploadResult.meta.last_row_id
    
    // Raw 데이터 저장 (processedData 사용)
    if (processedData && processedData.length > 0) {
      const batchSize = 100
      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize)
        const values = batch.map((d: any) => {
          // SQL injection 방지를 위해 문자열 escape
          const escape = (str: any) => String(str || '').replace(/'/g, "''")
          return `(${uploadId}, '${escape(d.workerName)}', '${escape(d.foDesc)}', '${escape(d.fdDesc)}', '${escape(d.startDatetime)}', '${escape(d.endDatetime)}', ${d.workerAct || 0}, '${escape(d.resultCnt)}', '${escape(d.workingDay)}', '${escape(d.workingShift)}', '${escape(d.actualShift)}', ${d.workRate || 0})`
        }).join(',')
        
        await env.DB.prepare(`
          INSERT INTO raw_data (upload_id, worker_name, fo_desc, fd_desc, start_datetime, end_datetime, worker_act, result_cnt, working_day, working_shift, actual_shift, work_rate)
          VALUES ${values}
        `).run()
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
    
    return c.json({ 
      success: true, 
      uploadId,
      message: 'Data saved successfully',
      stats: {
        totalRecords: processedData?.length || 0,
        uniqueWorkers: new Set(processedData?.map((d: any) => d.workerName)).size || 0
      }
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 업로드 목록 조회
app.get('/api/uploads', async (c) => {
  try {
    const { env } = c
    const { results } = await env.DB.prepare(`
      SELECT id, filename, upload_date, file_size, total_records, unique_workers, date_range_start, date_range_end
      FROM excel_uploads
      ORDER BY upload_date DESC
      LIMIT 50
    `).all()
    
    return c.json({ success: true, uploads: results })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

// API: 특정 업로드 데이터 조회
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
    
    // Raw 데이터
    const { results: rawData } = await env.DB.prepare(`
      SELECT * FROM raw_data WHERE upload_id = ?
    `).bind(uploadId).all()
    
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
      rawData,
      processMapping,
      shiftCalendar
    })
  } catch (error: any) {
    return c.json({ success: false, error: error.message }, 500)
  }
})

export default app
