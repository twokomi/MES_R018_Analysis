import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS 설정
app.use('/api/*', cors())

// 정적 파일 서빙
app.use('/*', serveStatic({ root: './public' }))

// API: 엑셀 데이터 저장
app.post('/api/upload', async (c) => {
  try {
    const { env } = c
    const body = await c.req.json()
    
    const { filename, fileSize, rawData, processedData, processMapping, shiftCalendar } = body
    
    // 업로드 기록 생성
    const uploadResult = await env.DB.prepare(`
      INSERT INTO excel_uploads (filename, file_size, total_records, unique_workers, date_range_start, date_range_end)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      filename,
      fileSize,
      processedData?.length || 0,
      new Set(processedData?.map((d: any) => d.worker_name)).size || 0,
      processedData?.[0]?.working_day || null,
      processedData?.[processedData.length - 1]?.working_day || null
    ).run()
    
    const uploadId = uploadResult.meta.last_row_id
    
    // Raw 데이터 저장
    if (processedData && processedData.length > 0) {
      const batchSize = 100
      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize)
        const values = batch.map((d: any) => 
          `(${uploadId}, '${d.worker_name}', '${d.fo_desc || ''}', '${d.fd_desc || ''}', '${d.start_datetime || ''}', '${d.end_datetime || ''}', ${d.worker_act || 0}, '${d.result_cnt || ''}', '${d.working_day || ''}', '${d.working_shift || ''}', '${d.actual_shift || ''}', ${d.work_rate || 0})`
        ).join(',')
        
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
          mapping.fd_desc || null,
          mapping.fo_desc || null,
          mapping.fo_desc_2 || null,
          mapping.fo_desc_3 || null,
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
          shift.day || null,
          shift.night || null
        ).run()
      }
    }
    
    return c.json({ 
      success: true, 
      uploadId,
      message: 'Data saved successfully',
      stats: {
        totalRecords: processedData?.length || 0,
        uniqueWorkers: new Set(processedData?.map((d: any) => d.worker_name)).size || 0
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

// 메인 페이지
app.get('/', (c) => {
  return c.redirect('/index.html')
})

export default app
