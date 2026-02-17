// MES Individual Performance Report Application
// Main application logic
// Version: 2.0.1 - Category Filter Debug Added

// Global state
const AppState = {
    rawData: [],
    processedData: [],
    processMapping: [],
    shiftCalendar: [],
    filters: {
        shift: '',
        workingDays: [],
        workingShift: '',
        categories: [],
        processes: [],
        workers: []
    },
    charts: {
        process: null,
        performance: null
    },
    mappingSort: {
        column: 'seq',
        ascending: true
    }
};

// Header normalization and synonym dictionary
const HEADER_SYNONYMS = {
    'workername': ['workername', 'worker', 'worker_name'],
    'fodesc': ['fodesc', 'fo_desc', 'fddesc', 'fd_desc'],
    'startdatetime': ['startdatetime', 'start_datetime', 'start_dt', 'startdt'],
    'enddatetime': ['enddatetime', 'end_datetime', 'end_dt', 'enddt'],
    'workeract': ['workeract', 'worker_act', 'workeractmins', 'workeractmin', 'worker_act_mins'],
    'resultcnt': ['resultcnt', 'result_cnt', 'resultcount'],
    'sectionid': ['sectionid', 'section_id', 'sectionno']
};

// Normalize header text
function normalizeHeader(header) {
    if (!header) return '';
    return header.toString()
        .trim()
        .toUpperCase()
        .replace(/[\s_-]/g, '')
        .replace(/[()]/g, '');
}

// Find column index by header name with synonyms
function findColumnIndex(headers, targetName) {
    const normalizedTarget = normalizeHeader(targetName);
    const synonyms = HEADER_SYNONYMS[normalizedTarget.toLowerCase()] || [normalizedTarget.toLowerCase()];
    
    for (let i = 0; i < headers.length; i++) {
        const normalizedHeader = normalizeHeader(headers[i]);
        if (synonyms.some(syn => normalizedHeader === normalizeHeader(syn))) {
            return i;
        }
    }
    return -1;
}

// Find mapping column index (simpler version for mapping sheet)
function findMappingColumnIndex(headers, targetName) {
    const normalizedTarget = normalizeHeader(targetName);
    
    for (let i = 0; i < headers.length; i++) {
        const normalizedHeader = normalizeHeader(headers[i]);
        if (normalizedHeader === normalizedTarget) {
            return i;
        }
    }
    return -1;
}

// Parse shift calendar date (handle various Korean date formats)
function parseShiftCalendarDate(dateValue) {
    if (!dateValue) return null;
    
    // If already a Date object
    if (dateValue instanceof Date) {
        return dateValue.toISOString().split('T')[0];
    }
    
    // If Excel serial number
    if (typeof dateValue === 'number') {
        const date = XLSX.SSF.parse_date_code(dateValue);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
    }
    
    // If Korean format like "02월 17일"
    if (typeof dateValue === 'string') {
        const match = dateValue.match(/(\d+)월\s*(\d+)일/);
        if (match) {
            const month = match[1].padStart(2, '0');
            const day = match[2].padStart(2, '0');
            // Assume current year or 2025
            const year = 2025;
            return `${year}-${month}-${day}`;
        }
        
        // Try standard date parsing
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
    }
    
    return null;
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 App initializing...');
    try {
        initTabs();
        console.log('✅ Tabs initialized');
        initFileUpload();
        console.log('✅ File upload initialized');
        initFilters();
        console.log('✅ Filters initialized');
        initMapping();
        console.log('✅ Mapping initialized');
        initJsonImportExport();
        console.log('✅ JSON import/export initialized');
        initViewToggle();
        console.log('✅ View toggle initialized');
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            const dropdowns = ['category', 'process', 'worker'];
            dropdowns.forEach(type => {
                const display = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}Display`);
                const dropdown = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`);
                
                if (display && dropdown && !display.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        });
        
        // Load default shift calendar and process mapping
        loadDefaultShiftCalendar();
        loadDefaultProcessMapping();
        
        // Render shift calendar
        renderShiftCalendar();
        console.log('✅ Shift calendar rendered');
        
        // Initialize calendar navigation
        initCalendarNavigation();
        console.log('✅ Calendar navigation initialized');
        
        console.log('🎉 App fully initialized!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// Load default shift calendar (February-April 2026 - 3 MONTHS)
function loadDefaultShiftCalendar() {
    AppState.shiftCalendar = [
        // February 2026 (28 days)
        { date: '2026-02-01', dayShift: 'A', nightShift: '' },
        { date: '2026-02-02', dayShift: 'A', nightShift: 'C' },
        { date: '2026-02-03', dayShift: 'B', nightShift: 'C' },
        { date: '2026-02-04', dayShift: 'B', nightShift: 'C' },
        { date: '2026-02-05', dayShift: 'A', nightShift: 'C' },
        { date: '2026-02-06', dayShift: 'A', nightShift: '' },
        { date: '2026-02-07', dayShift: 'B', nightShift: '' },
        { date: '2026-02-08', dayShift: 'B', nightShift: '' },
        { date: '2026-02-09', dayShift: 'B', nightShift: 'C' },
        { date: '2026-02-10', dayShift: 'A', nightShift: 'C' },
        { date: '2026-02-11', dayShift: 'A', nightShift: 'C' },
        { date: '2026-02-12', dayShift: 'B', nightShift: 'C' },
        { date: '2026-02-13', dayShift: 'B', nightShift: '' },
        { date: '2026-02-14', dayShift: 'A', nightShift: '' },
        { date: '2026-02-15', dayShift: 'A', nightShift: '' },
        { date: '2026-02-16', dayShift: 'A', nightShift: 'C' },
        { date: '2026-02-17', dayShift: 'B', nightShift: 'C' },
        { date: '2026-02-18', dayShift: 'B', nightShift: 'C' },
        { date: '2026-02-19', dayShift: 'A', nightShift: 'C' },
        { date: '2026-02-20', dayShift: 'A', nightShift: '' },
        { date: '2026-02-21', dayShift: 'B', nightShift: '' },
        { date: '2026-02-22', dayShift: 'B', nightShift: '' },
        { date: '2026-02-23', dayShift: 'B', nightShift: 'C' },
        { date: '2026-02-24', dayShift: 'A', nightShift: 'C' },
        { date: '2026-02-25', dayShift: 'A', nightShift: 'C' },
        { date: '2026-02-26', dayShift: 'B', nightShift: 'C' },
        { date: '2026-02-27', dayShift: 'B', nightShift: '' },
        { date: '2026-02-28', dayShift: 'A', nightShift: '' },
        
        // March 2026 (31 days) - Continuing pattern
        { date: '2026-03-01', dayShift: 'A', nightShift: '' },
        { date: '2026-03-02', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-03', dayShift: 'B', nightShift: 'C' },
        { date: '2026-03-04', dayShift: 'B', nightShift: 'C' },
        { date: '2026-03-05', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-06', dayShift: 'A', nightShift: '' },
        { date: '2026-03-07', dayShift: 'B', nightShift: '' },
        { date: '2026-03-08', dayShift: 'B', nightShift: '' },
        { date: '2026-03-09', dayShift: 'B', nightShift: 'C' },
        { date: '2026-03-10', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-11', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-12', dayShift: 'B', nightShift: 'C' },
        { date: '2026-03-13', dayShift: 'B', nightShift: '' },
        { date: '2026-03-14', dayShift: 'A', nightShift: '' },
        { date: '2026-03-15', dayShift: 'A', nightShift: '' },
        { date: '2026-03-16', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-17', dayShift: 'B', nightShift: 'C' },
        { date: '2026-03-18', dayShift: 'B', nightShift: 'C' },
        { date: '2026-03-19', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-20', dayShift: 'A', nightShift: '' },
        { date: '2026-03-21', dayShift: 'B', nightShift: '' },
        { date: '2026-03-22', dayShift: 'B', nightShift: '' },
        { date: '2026-03-23', dayShift: 'B', nightShift: 'C' },
        { date: '2026-03-24', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-25', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-26', dayShift: 'B', nightShift: 'C' },
        { date: '2026-03-27', dayShift: 'B', nightShift: '' },
        { date: '2026-03-28', dayShift: 'A', nightShift: '' },
        { date: '2026-03-29', dayShift: 'A', nightShift: '' },
        { date: '2026-03-30', dayShift: 'A', nightShift: 'C' },
        { date: '2026-03-31', dayShift: 'B', nightShift: 'C' },
        
        // April 2026 (30 days) - Continuing pattern
        { date: '2026-04-01', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-02', dayShift: 'A', nightShift: 'C' },
        { date: '2026-04-03', dayShift: 'A', nightShift: '' },
        { date: '2026-04-04', dayShift: 'B', nightShift: '' },
        { date: '2026-04-05', dayShift: 'B', nightShift: '' },
        { date: '2026-04-06', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-07', dayShift: 'A', nightShift: 'C' },
        { date: '2026-04-08', dayShift: 'A', nightShift: 'C' },
        { date: '2026-04-09', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-10', dayShift: 'B', nightShift: '' },
        { date: '2026-04-11', dayShift: 'A', nightShift: '' },
        { date: '2026-04-12', dayShift: 'A', nightShift: '' },
        { date: '2026-04-13', dayShift: 'A', nightShift: 'C' },
        { date: '2026-04-14', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-15', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-16', dayShift: 'A', nightShift: 'C' },
        { date: '2026-04-17', dayShift: 'A', nightShift: '' },
        { date: '2026-04-18', dayShift: 'B', nightShift: '' },
        { date: '2026-04-19', dayShift: 'B', nightShift: '' },
        { date: '2026-04-20', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-21', dayShift: 'A', nightShift: 'C' },
        { date: '2026-04-22', dayShift: 'A', nightShift: 'C' },
        { date: '2026-04-23', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-24', dayShift: 'B', nightShift: '' },
        { date: '2026-04-25', dayShift: 'A', nightShift: '' },
        { date: '2026-04-26', dayShift: 'A', nightShift: '' },
        { date: '2026-04-27', dayShift: 'A', nightShift: 'C' },
        { date: '2026-04-28', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-29', dayShift: 'B', nightShift: 'C' },
        { date: '2026-04-30', dayShift: 'A', nightShift: 'C' }
    ];
    console.log(`✅ ${AppState.shiftCalendar.length} default Shift Calendar entries loaded (Feb-Apr 2026)`);
}

// Tab management
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('tab-active'));
            button.classList.add('tab-active');
            
            // Show target tab content
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(targetTab + 'Tab').classList.remove('hidden');
        });
    });
}

// File upload initialization
function initFileUpload() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    // Click to upload
    uploadZone.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            fileInput.click();
        }
    });
    
    // Drag and drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// Handle file upload
function handleFileUpload(file) {
    // Check if it's a JSON file
    if (file.name.match(/\.json$/i)) {
        // Handle JSON import
        importFromJson(file);
        return;
    }
    
    // Check if it's an Excel file
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        alert('Excel (.xlsx, .xls) or JSON (.json) files only.');
        return;
    }
    
    showUploadStatus(true);
    updateProgress(10);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            updateProgress(30);
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array', cellDates: true });
            
            updateProgress(40);
            
            // First, try to load shift calendar from workbook
            const shiftCalendarSheetName = workbook.SheetNames.find(name => {
                const normalized = normalizeHeader(name);
                return normalized === 'SHIFTCALENDAR' || normalized === 'SHIFT' || normalized === 'CALENDAR';
            });
            
            if (shiftCalendarSheetName) {
                try {
                    const shiftCalendarSheet = workbook.Sheets[shiftCalendarSheetName];
                    const shiftCalendarData = XLSX.utils.sheet_to_json(shiftCalendarSheet, { header: 1, raw: false });
                    
                    if (shiftCalendarData.length > 1) {
                        const shiftHeaders = shiftCalendarData[0];
                        const shiftRows = shiftCalendarData.slice(1);
                        
                        // Find column indices for shift calendar
                        const colDate = findMappingColumnIndex(shiftHeaders, 'date');
                        const colDay = findMappingColumnIndex(shiftHeaders, 'day');
                        const colNight = findMappingColumnIndex(shiftHeaders, 'night');
                        
                        if (colDate !== -1) {
                            AppState.shiftCalendar = [];
                            
                            shiftRows.forEach(row => {
                                if (row && row[colDate]) {
                                    const dateStr = parseShiftCalendarDate(row[colDate]);
                                    if (dateStr) {
                                        AppState.shiftCalendar.push({
                                            date: dateStr,
                                            dayShift: colDay !== -1 ? (row[colDay] || '').trim() : '',
                                            nightShift: colNight !== -1 ? (row[colNight] || '').trim() : ''
                                        });
                                    }
                                }
                            });
                            
                            console.log(`✅ ${AppState.shiftCalendar.length}개의 Shift Calendar 항목을 불러왔습니다.`);
                        }
                    }
                } catch (err) {
                    console.warn('Shift Calendar 시트 로드 실패:', err);
                }
            }
            
            // Load process mapping from workbook
            const mappingSheetName = workbook.SheetNames.find(name => {
                const normalized = normalizeHeader(name);
                return normalized === 'MAPPING' || normalized === 'PROCESSMAPPING' || normalized === 'PROCESSMAP';
            });
            
            if (mappingSheetName) {
                try {
                    const mappingSheet = workbook.Sheets[mappingSheetName];
                    const mappingData = XLSX.utils.sheet_to_json(mappingSheet, { header: 1, raw: false });
                    
                    if (mappingData.length > 1) {
                        const mappingHeaders = mappingData[0];
                        const mappingRows = mappingData.slice(1);
                        
                        // Find column indices for mapping
                        const colFODesc = findMappingColumnIndex(mappingHeaders, 'fodesc');
                        const colFODesc2 = findMappingColumnIndex(mappingHeaders, 'fodesc2');
                        const colFODesc3 = findMappingColumnIndex(mappingHeaders, 'fodesc3');
                        const colSeq = findMappingColumnIndex(mappingHeaders, 'seq');
                        
                        if (colFODesc !== -1 && colFODesc3 !== -1) {
                            AppState.processMapping = [];
                            
                            mappingRows.forEach(row => {
                                if (row && row[colFODesc]) {
                                    AppState.processMapping.push({
                                        fdDesc: row[colFODesc],
                                        foDesc2: colFODesc2 !== -1 ? (row[colFODesc2] || '') : '',
                                        foDesc3: row[colFODesc3] || row[colFODesc],
                                        seq: colSeq !== -1 ? (parseInt(row[colSeq]) || 999) : 999
                                    });
                                }
                            });
                            
                            updateMappingTable();
                            console.log(`✅ ${AppState.processMapping.length} process mappings loaded`);
                        }
                    }
                } catch (err) {
                    console.warn('매핑 시트 로드 실패:', err);
                }
            }
            
            updateProgress(50);
            
            // Find Raw sheet
            const rawSheetName = workbook.SheetNames.find(name => 
                normalizeHeader(name) === 'RAW'
            );
            
            if (!rawSheetName) {
                throw new Error("'Raw' 시트를 찾을 수 없습니다.");
            }
            
            updateProgress(60);
            const rawSheet = workbook.Sheets[rawSheetName];
            const rawData = XLSX.utils.sheet_to_json(rawSheet, { header: 1, raw: false });
            
            if (rawData.length < 2) {
                throw new Error("Raw 시트에 데이터가 없습니다.");
            }
            
            updateProgress(70);
            
            // Parse and process data
            const headers = rawData[0];
            const dataRows = rawData.slice(1);
            
            // Validate required headers
            const requiredHeaders = ['workername', 'fodesc', 'workeract', 'resultcnt'];
            const missingHeaders = [];
            
            requiredHeaders.forEach(header => {
                if (findColumnIndex(headers, header) === -1) {
                    missingHeaders.push(header);
                }
            });
            
            // Check for datetime (either Start or End)
            const hasStartDt = findColumnIndex(headers, 'startdatetime') !== -1;
            const hasEndDt = findColumnIndex(headers, 'enddatetime') !== -1;
            
            if (!hasStartDt && !hasEndDt) {
                missingHeaders.push('startdatetime or enddatetime');
            }
            
            if (missingHeaders.length > 0) {
                throw new Error(`필수 헤더가 누락되었습니다: ${missingHeaders.join(', ')}`);
            }
            
            updateProgress(80);
            
            // Parse data rows
            AppState.rawData = parseRawData(headers, dataRows);
            
            updateProgress(90);
            
            // Process data
            AppState.processedData = processData(AppState.rawData);
            
            updateProgress(100);
            
            // Show success
            showUploadResult(AppState.processedData);
            
            // Update report
            updateReport();
            
            // Enable export button
            document.getElementById('exportJsonBtn').disabled = false;
            
            // Save to database
            saveToDatabase(file.name, file.size);
            
            setTimeout(() => {
                showUploadStatus(false);
            }, 1000);
            
        } catch (error) {
            console.error('File parsing error:', error);
            alert('파일 처리 중 오류가 발생했습니다:\n' + error.message);
            showUploadStatus(false);
        }
    };
    
    reader.onerror = function() {
        alert('파일을 읽는 중 오류가 발생했습니다.');
        showUploadStatus(false);
    };
    
    reader.readAsArrayBuffer(file);
}

// Parse raw data
function parseRawData(headers, dataRows) {
    const parsed = [];
    
    // Find column indices
    const colWorkerName = findColumnIndex(headers, 'workername');
    const colFODesc = findColumnIndex(headers, 'fodesc');
    const colStartDt = findColumnIndex(headers, 'startdatetime');
    const colEndDt = findColumnIndex(headers, 'enddatetime');
    const colWorkerAct = findColumnIndex(headers, 'workeract');
    const colResultCnt = findColumnIndex(headers, 'resultcnt');
    const colSectionId = findColumnIndex(headers, 'sectionid');
    
    dataRows.forEach((row, index) => {
        if (!row || row.length === 0) return;
        
        const workerName = row[colWorkerName];
        if (!workerName) return; // Skip empty rows
        
        const record = {
            rowIndex: index + 2, // Excel row (1-indexed + header)
            sectionId: colSectionId !== -1 ? row[colSectionId] : `ROW_${index + 2}`,
            workerName: workerName,
            fdDesc: row[colFODesc] || '',
            startDatetime: colStartDt !== -1 ? parseExcelDate(row[colStartDt]) : null,
            endDatetime: colEndDt !== -1 ? parseExcelDate(row[colEndDt]) : null,
            workerActMins: parseFloat(row[colWorkerAct]) || 0,
            resultCnt: row[colResultCnt]
        };
        
        parsed.push(record);
    });
    
    return parsed;
}

// Parse Excel date (handle various formats)
function parseExcelDate(dateValue) {
    if (!dateValue) return null;
    
    // If already a Date object
    if (dateValue instanceof Date) {
        return dateValue;
    }
    
    // If Excel serial number
    if (typeof dateValue === 'number') {
        return XLSX.SSF.parse_date_code(dateValue);
    }
    
    // If string, try to parse
    if (typeof dateValue === 'string') {
        const parsed = new Date(dateValue);
        if (!isNaN(parsed.getTime())) {
            return parsed;
        }
    }
    
    return null;
}

// Process data (calculate Working Day, Shift, apply mapping)
function processData(rawData) {
    const processed = [];
    
    console.log(`🔍 Processing ${rawData.length} raw records...`);
    console.log(`📋 Current mappings count: ${AppState.processMapping.length}`);
    
    // Debug: Show first few mappings
    if (AppState.processMapping.length > 0) {
        console.log(`📝 Sample mappings:`, AppState.processMapping.slice(0, 3).map(m => 
            `${m.fdDesc} → ${m.foDesc2} / ${m.foDesc3} (Seq: ${m.seq})`
        ).join(', '));
    }
    
    let mappedCount = 0;
    let notFoundCount = 0;
    
    rawData.forEach(record => {
        // Determine base datetime
        const baseDt = record.startDatetime || record.endDatetime;
        if (!baseDt) {
            console.warn(`No datetime found for row ${record.rowIndex}`);
            return;
        }
        
        // Calculate Working Day and Shift (Day/Night)
        const { workingDay, workingShift } = calculateWorkingDayShift(baseDt);
        
        // Determine actual Shift (A/B/C) from ShiftCalendar
        const actualShift = getActualShift(workingDay, workingShift);
        
        // Determine valid flag
        const validFlag = isValidResult(record.resultCnt) ? 1 : 0;
        
        // Apply process mapping
        const mapping = findProcessMapping(record.fdDesc);
        
        if (mapping.status === 'OK') {
            mappedCount++;
        } else if (mapping.status === 'Not Found') {
            notFoundCount++;
        }
        
        const processedRecord = {
            ...record,
            validFlag: validFlag,
            workingDay: workingDay,
            workingShift: workingShift,
            actualShift: actualShift,
            foDesc2: mapping.foDesc2,
            foDesc3: mapping.foDesc3,
            seq: mapping.seq,
            mappingStatus: mapping.status
        };
        
        processed.push(processedRecord);
    });
    
    console.log(`✅ Mapping results: ${mappedCount} matched, ${notFoundCount} not found`);
    
    // Debug: Show sample records with detailed info
    if (processed.length > 0) {
        const sampleRecords = processed.slice(0, 3);
        console.log(`📋 Sample records for validation:`);
        sampleRecords.forEach((r, idx) => {
            const datetime = r.startDatetime || r.endDatetime;
            const timeStr = datetime ? datetime.toISOString() : 'N/A';
            console.log(`  [${idx+1}] Worker: ${r.workerName}, Process: ${r.foDesc3}`);
            console.log(`      DateTime: ${timeStr}`);
            console.log(`      Working Day: ${r.workingDay}, Shift: ${r.workingShift}, Actual: ${r.actualShift}`);
            console.log(`      Result Cnt: "${r.resultCnt}", Valid: ${r.validFlag}, Minutes: ${r.workerActMins}`);
        });
    }
    
    // Debug: Show unique categories with counts
    const categoryCount = {};
    processed.forEach(r => {
        if (r.foDesc2) {
            categoryCount[r.foDesc2] = (categoryCount[r.foDesc2] || 0) + 1;
        }
    });
    const uniqueCategories = Object.keys(categoryCount).sort();
    console.log(`📂 Unique categories (FO Desc 2): ${uniqueCategories.length}`, uniqueCategories);
    console.log(`📊 Category counts:`, categoryCount);
    
    // Debug: Show unique processes with their Seq
    const processSeqMap = {};
    processed.forEach(r => {
        if (!processSeqMap[r.foDesc3]) {
            processSeqMap[r.foDesc3] = r.seq;
        }
    });
    
    const sortedProcesses = Object.entries(processSeqMap)
        .sort((a, b) => a[1] - b[1]);
    
    console.log('📊 Processes with Seq:', sortedProcesses.map(([name, seq]) => `${name} (Seq: ${seq})`).join(', '));
    
    // Debug: Show date/shift distribution
    const dateShiftCount = {};
    processed.forEach(r => {
        const key = `${r.workingDay}_${r.actualShift}_${r.workingShift}`;
        dateShiftCount[key] = (dateShiftCount[key] || 0) + 1;
    });
    console.log('📊 Date/Shift distribution:', dateShiftCount);
    
    return processed;
}

// Calculate Working Day and Shift
function calculateWorkingDayShift(datetime) {
    if (!datetime || !(datetime instanceof Date)) {
        return { workingDay: null, workingShift: null };
    }
    
    const hours = datetime.getHours();
    const minutes = datetime.getMinutes();
    const timeInMinutes = hours * 60 + minutes;
    
    // Day shift: 06:00 - 18:00 (360 - 1080 minutes)
    // Night shift: 18:00 - 06:00
    const dayStartMinutes = 6 * 60; // 360 (06:00)
    const nightStartMinutes = 18 * 60; // 1080 (18:00)
    
    let workingDay = new Date(datetime);
    let workingShift = 'Day';
    
    if (timeInMinutes >= dayStartMinutes && timeInMinutes < nightStartMinutes) {
        // Day shift: 06:00-17:59
        // Working day is same as calendar day
        workingShift = 'Day';
    } else {
        // Night shift: 18:00-05:59
        workingShift = 'Night';
        
        // If time is 00:00-05:59 (before 06:00), working day is previous day
        if (timeInMinutes < dayStartMinutes) {
            workingDay.setDate(workingDay.getDate() - 1);
        }
        // If time is 18:00-23:59, working day stays the same
    }
    
    // Format as YYYY-MM-DD
    const workingDayStr = workingDay.toISOString().split('T')[0];
    
    return {
        workingDay: workingDayStr,
        workingShift: workingShift
    };
}

// Get actual shift (A/B/C) from ShiftCalendar
function getActualShift(workingDay, workingShift) {
    if (!AppState.shiftCalendar || AppState.shiftCalendar.length === 0) {
        return ''; // No shift calendar available
    }
    
    const calendarEntry = AppState.shiftCalendar.find(entry => entry.date === workingDay);
    
    if (!calendarEntry) {
        return ''; // Date not found in calendar
    }
    
    if (workingShift === 'Day') {
        return calendarEntry.dayShift;
    } else if (workingShift === 'Night') {
        return calendarEntry.nightShift;
    }
    
    return '';
}

// Check if result is valid (IS "X" - meaning completed/should be counted)
function isValidResult(resultCnt) {
    if (!resultCnt) return false;
    const normalized = normalizeHeader(resultCnt.toString());
    return normalized === 'X'; // Changed: X means valid/completed work
}

// Find process mapping
function findProcessMapping(fdDesc) {
    if (!fdDesc) {
        return {
            foDesc2: '',
            foDesc3: '',
            seq: 999,
            status: 'Empty'
        };
    }
    
    const normalized = normalizeHeader(fdDesc);
    const mapping = AppState.processMapping.find(m => 
        normalizeHeader(m.fdDesc) === normalized
    );
    
    if (mapping) {
        return {
            foDesc2: mapping.foDesc2,
            foDesc3: mapping.foDesc3,
            seq: mapping.seq,
            status: 'OK'
        };
    }
    
    // Auto-categorize based on process name patterns
    let autoCategory = 'Other';
    const fdLower = fdDesc.toLowerCase();
    
    if (fdLower.includes('qc') || fdLower.includes('inspection')) {
        autoCategory = 'IM QC';
    } else if (fdLower.includes('cut') || fdLower.includes('bevel') || fdLower.includes('bend')) {
        autoCategory = 'BT Process';
    } else if (fdLower.includes('paint') || fdLower.includes('blast') || fdLower.includes('metaliz')) {
        autoCategory = 'BT Complete';
    } else if (fdLower.includes('weld') || fdLower.includes('fit')) {
        autoCategory = 'BT Process';
    } else if (fdLower.includes('wash') || fdLower.includes('clean')) {
        autoCategory = 'BT Complete';
    } else if (fdLower.includes('cso') || fdLower.includes('csi') || fdLower.includes('fu')) {
        autoCategory = 'Production';
    }
    
    return {
        foDesc2: autoCategory,
        foDesc3: fdDesc, // Use original as fallback
        seq: 999,
        status: 'Not Found (Auto-categorized)'
    };
}

// Show upload status
function showUploadStatus(show) {
    const statusDiv = document.getElementById('uploadStatus');
    const resultDiv = document.getElementById('uploadResult');
    
    if (show) {
        statusDiv.classList.remove('hidden');
        resultDiv.classList.add('hidden');
    } else {
        statusDiv.classList.add('hidden');
    }
}

// Update progress bar
function updateProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = percent + '%';
}

// Show upload result
function showUploadResult(data) {
    const resultDiv = document.getElementById('uploadResult');
    const recordCount = document.getElementById('recordCount');
    const dateRange = document.getElementById('dateRange');
    const workerCount = document.getElementById('workerCount');
    
    // Calculate stats
    const uniqueDates = [...new Set(data.map(d => d.workingDay))].filter(d => d).sort();
    const uniqueWorkers = [...new Set(data.map(d => d.workerName))];
    
    recordCount.textContent = data.length;
    dateRange.textContent = uniqueDates.length > 0 
        ? `${uniqueDates[0]} ~ ${uniqueDates[uniqueDates.length - 1]}`
        : '-';
    workerCount.textContent = uniqueWorkers.length;
    
    resultDiv.classList.remove('hidden');
}

// Initialize filters
function initFilters() {
    document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);
    
    // Shift filter change handler
    document.getElementById('filterShift').addEventListener('change', onShiftFilterChange);
}

// Handle shift filter change
function onShiftFilterChange() {
    const selectedShift = document.getElementById('filterShift').value;
    updateWorkingDayOptions(selectedShift);
}

// Handle shift filter change
function onShiftFilterChange() {
    const selectedShift = document.getElementById('filterShift').value;
    updateWorkingDayOptions(selectedShift);
}

// Update working day options based on selected shift
function updateWorkingDayOptions(selectedShift) {
    const daySelect = document.getElementById('filterWorkingDay');
    
    if (!selectedShift) {
        // Show all dates
        const uniqueDays = [...new Set(AppState.processedData.map(d => d.workingDay))].filter(d => d).sort();
        daySelect.innerHTML = '';
        uniqueDays.forEach(day => {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            daySelect.appendChild(option);
        });
    } else {
        // Show only dates where selected shift is working
        const relevantDates = new Set();
        
        if (AppState.shiftCalendar && AppState.shiftCalendar.length > 0) {
            AppState.shiftCalendar.forEach(entry => {
                if (entry.dayShift === selectedShift || entry.nightShift === selectedShift) {
                    relevantDates.add(entry.date);
                }
            });
        } else {
            // Fallback: if no shift calendar, show dates where actualShift matches
            AppState.processedData.forEach(record => {
                if (record.actualShift === selectedShift) {
                    relevantDates.add(record.workingDay);
                }
            });
        }
        
        const sortedDates = [...relevantDates].sort();
        daySelect.innerHTML = '';
        
        if (sortedDates.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No working days for this shift';
            option.disabled = true;
            daySelect.appendChild(option);
        } else {
            sortedDates.forEach(date => {
                const option = document.createElement('option');
                option.value = date;
                option.textContent = date;
                daySelect.appendChild(option);
            });
        }
    }
}

// Update filter options
function updateFilterOptions() {
    const data = AppState.processedData;
    
    console.log(`🔧 Updating filter options with ${data.length} records`);
    
    // Update working day options based on current shift filter
    const selectedShift = document.getElementById('filterShift').value;
    updateWorkingDayOptions(selectedShift);
    
    // Category (FO Desc 2) - Sort alphabetically
    const uniqueCategories = [...new Set(data.map(d => d.foDesc2))].filter(c => c).sort();
    console.log(`📂 Found ${uniqueCategories.length} unique categories:`, uniqueCategories);
    
    const categoryDropdown = document.getElementById('filterCategoryDropdown');
    if (categoryDropdown) {
        categoryDropdown.innerHTML = uniqueCategories.map(category => `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                <input type="checkbox" value="${category}" class="mr-3 h-4 w-4 text-blue-600 category-checkbox" onchange="updateCheckboxDisplay('category')">
                <span class="text-sm text-gray-700">${category}</span>
            </label>
        `).join('');
    }
    console.log(`✅ Category dropdown updated with ${uniqueCategories.length} options`);
    
    // Process (FO Desc 3) - Show all processes sorted by Seq
    const processMap = new Map();
    data.forEach(d => {
        if (d.foDesc3 && !processMap.has(d.foDesc3)) {
            processMap.set(d.foDesc3, d.seq !== undefined ? d.seq : 999);
        }
    });
    
    const processes = Array.from(processMap.entries())
        .sort((a, b) => {
            if (a[1] !== b[1]) return a[1] - b[1];
            return a[0].localeCompare(b[0]);
        })
        .map(entry => entry[0]);
    
    const processDropdown = document.getElementById('filterProcessDropdown');
    if (processDropdown) {
        processDropdown.innerHTML = processes.map(process => `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                <input type="checkbox" value="${process}" class="mr-3 h-4 w-4 text-blue-600 process-checkbox" onchange="updateCheckboxDisplay('process')">
                <span class="text-sm text-gray-700">${process}</span>
            </label>
        `).join('');
    }
    
    // Worker
    const uniqueWorkers = [...new Set(data.map(d => d.workerName))].filter(w => w).sort();
    const workerDropdown = document.getElementById('filterWorkerDropdown');
    if (workerDropdown) {
        workerDropdown.innerHTML = uniqueWorkers.map(worker => `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                <input type="checkbox" value="${worker}" class="mr-3 h-4 w-4 text-blue-600 worker-checkbox" onchange="updateCheckboxDisplay('worker')">
                <span class="text-sm text-gray-700">${worker}</span>
            </label>
        `).join('');
    }
}

// Toggle checkbox dropdown
function toggleCheckboxDropdown(type) {
    const dropdown = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`);
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
    
    // Close other dropdowns
    const types = ['category', 'process', 'worker'];
    types.forEach(t => {
        if (t !== type) {
            const otherDropdown = document.getElementById(`filter${t.charAt(0).toUpperCase() + t.slice(1)}Dropdown`);
            if (otherDropdown) {
                otherDropdown.classList.add('hidden');
            }
        }
    });
}

// Update checkbox display
function updateCheckboxDisplay(type) {
    const checkboxes = document.querySelectorAll(`.${type}-checkbox:checked`);
    const selected = Array.from(checkboxes).map(cb => cb.value).filter(v => v);
    const displayBtn = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}Display`);
    
    if (displayBtn) {
        const textSpan = displayBtn.querySelector('span');
        if (selected.length === 0) {
            textSpan.textContent = 'Select...';
            textSpan.className = 'text-gray-500';
        } else if (selected.length === 1) {
            textSpan.textContent = selected[0];
            textSpan.className = 'text-gray-900';
        } else {
            textSpan.textContent = `${selected.length} selected`;
            textSpan.className = 'text-gray-900 font-medium';
        }
    }
}

// Apply filters
function applyFilters() {
    const daySelect = document.getElementById('filterWorkingDay');
    const selectedDays = Array.from(daySelect.selectedOptions).map(opt => opt.value);
    
    // Get checked categories
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox:checked');
    const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value).filter(v => v);
    
    // Get checked processes
    const processCheckboxes = document.querySelectorAll('.process-checkbox:checked');
    const selectedProcesses = Array.from(processCheckboxes).map(cb => cb.value).filter(v => v);
    
    // Get checked workers
    const workerCheckboxes = document.querySelectorAll('.worker-checkbox:checked');
    const selectedWorkers = Array.from(workerCheckboxes).map(cb => cb.value).filter(v => v);
    
    AppState.filters = {
        shift: document.getElementById('filterShift').value,
        workingDays: selectedDays,
        workingShift: document.getElementById('filterWorkingShift').value,
        categories: selectedCategories,
        processes: selectedProcesses,
        workers: selectedWorkers
    };
    
    console.log('🎯 Applied filters:', AppState.filters);
    updateReport();
}

// Reset filters
function resetFilters() {
    document.getElementById('filterShift').value = '';
    document.getElementById('filterWorkingDay').innerHTML = '';
    document.getElementById('filterWorkingShift').value = '';
    
    // Uncheck all checkboxes
    document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.process-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.worker-checkbox').forEach(cb => cb.checked = false);
    
    // Reset displays
    updateCheckboxDisplay('category');
    updateCheckboxDisplay('process');
    updateCheckboxDisplay('worker');
    
    AppState.filters = {
        shift: '',
        workingDays: [],
        workingShift: '',
        categories: [],
        processes: [],
        workers: []
    };
    
    updateFilterOptions();
    updateReport();
}

// Get filtered data
function getFilteredData() {
    let filtered = AppState.processedData;
    
    console.log(`🔍 Starting filter with ${filtered.length} records`);
    console.log('Applied filters:', AppState.filters);
    
    // Filter by shift (A/B/C)
    if (AppState.filters.shift) {
        filtered = filtered.filter(d => d.actualShift === AppState.filters.shift);
        console.log(`After shift filter (${AppState.filters.shift}): ${filtered.length} records`);
    }
    
    // Filter by working days (multiple selection)
    if (AppState.filters.workingDays && AppState.filters.workingDays.length > 0) {
        filtered = filtered.filter(d => AppState.filters.workingDays.includes(d.workingDay));
        console.log(`After date filter (${AppState.filters.workingDays}): ${filtered.length} records`);
    }
    
    // Filter by working shift (Day/Night)
    if (AppState.filters.workingShift) {
        filtered = filtered.filter(d => d.workingShift === AppState.filters.workingShift);
        console.log(`After Day/Night filter (${AppState.filters.workingShift}): ${filtered.length} records`);
    }
    
    // Filter by category (FO Desc 2) - multiple selection
    if (AppState.filters.categories && AppState.filters.categories.length > 0) {
        filtered = filtered.filter(d => AppState.filters.categories.includes(d.foDesc2));
        console.log(`After category filter (${AppState.filters.categories}): ${filtered.length} records`);
    }
    
    // Filter by process (FO Desc 3) - multiple selection
    if (AppState.filters.processes && AppState.filters.processes.length > 0) {
        filtered = filtered.filter(d => AppState.filters.processes.includes(d.foDesc3));
        console.log(`After process filter (${AppState.filters.processes}): ${filtered.length} records`);
    }
    
    // Filter by worker - multiple selection
    if (AppState.filters.workers && AppState.filters.workers.length > 0) {
        filtered = filtered.filter(d => AppState.filters.workers.includes(d.workerName));
        console.log(`After worker filter (${AppState.filters.workers}): ${filtered.length} records`);
    }
    
    console.log(`✅ Final filtered: ${filtered.length} records`);
    
    // Debug: Show sample of filtered data
    if (filtered.length > 0 && filtered.length <= 5) {
        console.log('Sample filtered data:', filtered);
    }
    
    return filtered;
}

// Update report
function updateReport() {
    updateFilterOptions();
    
    const filteredData = getFilteredData();
    
    // Aggregate by worker
    const workerAgg = aggregateByWorker(filteredData);
    
    updateKPIs(workerAgg);
    updatePerformanceBands(workerAgg);
    updateCharts(workerAgg, filteredData);
    updateDataTable(workerAgg);
    updatePivotReport(workerAgg);
}

// Update pivot-style report (date-wise breakdown)
function updatePivotReport(workerAgg) {
    const pivotDiv = document.getElementById('pivotReportView');
    
    if (workerAgg.length === 0) {
        pivotDiv.innerHTML = '<p class="text-gray-500 text-center py-8">데이터를 업로드하고 필터를 적용해주세요</p>';
        return;
    }
    
    // Group by process and worker, then pivot by date
    const processGroups = {};
    
    workerAgg.forEach(item => {
        const processKey = item.foDesc3 || 'Unknown';
        
        if (!processGroups[processKey]) {
            processGroups[processKey] = {
                seq: item.seq !== undefined ? item.seq : 999,
                workers: {}
            };
        } else {
            // Update seq to minimum value (most reliable)
            const itemSeq = item.seq !== undefined ? item.seq : 999;
            if (itemSeq < processGroups[processKey].seq) {
                processGroups[processKey].seq = itemSeq;
            }
        }
        
        const workerKey = item.workerName;
        if (!processGroups[processKey].workers[workerKey]) {
            processGroups[processKey].workers[workerKey] = {};
        }
        
        const dateKey = item.workingDay;
        processGroups[processKey].workers[workerKey][dateKey] = {
            validCount: item.validCount,
            totalMinutes: item.totalMinutes,
            workRate: item.workRate
        };
    });
    
    // Get all unique dates, sorted
    const allDates = [...new Set(workerAgg.map(item => item.workingDay))].sort();
    
    // Build HTML table
    let html = '<table class="pivot-table">';
    
    // Header row
    html += '<thead><tr>';
    html += '<th rowspan="2" style="min-width: 200px; text-align: left;">Worker Name</th>';
    allDates.forEach(date => {
        html += `<th colspan="3">${date}</th>`;
    });
    html += '</tr><tr>';
    allDates.forEach(() => {
        html += '<th style="font-size: 0.7rem;">WO Count</th>';
        html += '<th style="font-size: 0.7rem;">Std Time(m)</th>';
        html += '<th style="font-size: 0.7rem;">Work Rate</th>';
    });
    html += '</tr></thead>';
    
    // Body rows - grouped by process, sorted by Seq THEN by process name
    html += '<tbody>';
    const sortedProcesses = Object.entries(processGroups)
        .sort((a, b) => {
            const seqA = a[1].seq !== undefined ? a[1].seq : 999;
            const seqB = b[1].seq !== undefined ? b[1].seq : 999;
            // First sort by Seq
            if (seqA !== seqB) return seqA - seqB;
            // If Seq is same, sort alphabetically by process name
            return a[0].localeCompare(b[0]);
        });
    
    console.log('📊 Pivot Report Process Order:', sortedProcesses.map(([name, data]) => `${name} (Seq: ${data.seq})`));
    
    sortedProcesses.forEach(([processName, processData]) => {
        // Process header row - LEFT ALIGNED
        html += `<tr><td colspan="${1 + allDates.length * 3}" class="process-cell" style="text-align: left; padding-left: 1rem; font-weight: 700; font-size: 0.95rem;">${processName}</td></tr>`;
        
        // Worker rows
        const sortedWorkers = Object.keys(processData.workers).sort();
        sortedWorkers.forEach(workerName => {
            html += '<tr>';
            html += `<td class="worker-cell" style="text-align: left; padding-left: 2rem;">${workerName}</td>`;
            
            allDates.forEach(date => {
                const dateData = processData.workers[workerName][date];
                
                if (dateData) {
                    const rateClass = dateData.workRate >= 80 ? 'work-rate-high' :
                                    dateData.workRate >= 50 ? 'work-rate-normal' :
                                    dateData.workRate >= 30 ? 'work-rate-low' : 'work-rate-critical';
                    
                    html += `<td>${dateData.validCount}</td>`;
                    html += `<td>${Math.round(dateData.totalMinutes)}</td>`;
                    html += `<td class="${rateClass}">${dateData.workRate.toFixed(0)}%</td>`;
                } else {
                    html += '<td>-</td><td>-</td><td>-</td>';
                }
            });
            
            html += '</tr>';
        });
    });
    
    html += '</tbody></table>';
    
    pivotDiv.innerHTML = html;
}

// Aggregate data by worker
function aggregateByWorker(data) {
    const aggregated = {};
    
    let totalRecords = 0;
    let validRecords = 0;
    let invalidRecords = 0;
    
    data.forEach(record => {
        totalRecords++;
        
        const key = `${record.workerName}|${record.workingDay}|${record.workingShift}|${record.actualShift}|${record.foDesc3}`;
        
        if (!aggregated[key]) {
            aggregated[key] = {
                workerName: record.workerName,
                foDesc3: record.foDesc3,
                workingDay: record.workingDay,
                workingShift: record.workingShift,
                actualShift: record.actualShift,
                totalMinutes: 0,
                validCount: 0,
                seq: record.seq
            };
        }
        
        // CRITICAL: Only count minutes for VALID work orders (Result Cnt = "X")
        if (record.validFlag === 1) {
            aggregated[key].totalMinutes += record.workerActMins;
            aggregated[key].validCount += 1;
            validRecords++;
        } else {
            invalidRecords++;
        }
    });
    
    console.log(`📊 Aggregation summary: ${totalRecords} total records, ${validRecords} valid (X), ${invalidRecords} invalid`);
    
    // Convert to array and calculate work rate
    const result = Object.values(aggregated).map(item => {
        const workRate = (item.totalMinutes / 660) * 100;
        return {
            ...item,
            workRate: workRate,
            performanceBand: getPerformanceBand(workRate)
        };
    });
    
    // Sort by seq, then worker name
    result.sort((a, b) => {
        const seqA = a.seq !== undefined ? a.seq : 999;
        const seqB = b.seq !== undefined ? b.seq : 999;
        if (seqA !== seqB) return seqA - seqB;
        return a.workerName.localeCompare(b.workerName);
    });
    
    return result;
}

// Get performance band
function getPerformanceBand(workRate) {
    if (workRate >= 80) return 'Excellent';
    if (workRate >= 50) return 'Normal';
    if (workRate >= 30) return 'Poor';
    return 'Critical';
}

// Update KPIs
function updateKPIs(workerAgg) {
    const totalWorkers = new Set(workerAgg.map(w => w.workerName)).size;
    const totalValidWO = workerAgg.reduce((sum, w) => sum + w.validCount, 0);
    const totalMinutes = workerAgg.reduce((sum, w) => sum + w.totalMinutes, 0);
    const avgWorkRate = workerAgg.length > 0 
        ? workerAgg.reduce((sum, w) => sum + w.workRate, 0) / workerAgg.length 
        : 0;
    
    document.getElementById('kpiWorkers').textContent = totalWorkers;
    document.getElementById('kpiValidWO').textContent = totalValidWO;
    document.getElementById('kpiTotalMinutes').textContent = Math.round(totalMinutes);
    document.getElementById('kpiAvgWorkRate').textContent = avgWorkRate.toFixed(1) + '%';
}

// Update performance bands
function updatePerformanceBands(workerAgg) {
    const excellent = workerAgg.filter(w => w.performanceBand === 'Excellent');
    const poor = workerAgg.filter(w => w.performanceBand === 'Poor');
    const critical = workerAgg.filter(w => w.performanceBand === 'Critical');
    
    // Excellent workers
    const excellentDiv = document.getElementById('excellentWorkers');
    if (excellent.length > 0) {
        excellentDiv.innerHTML = '<div class="space-y-2">' + excellent.map(w => 
            `<div class="flex flex-col p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-green-900">${w.workerName}</span>
                    <span class="text-green-600 font-bold text-lg">${w.workRate.toFixed(1)}%</span>
                </div>
                <div class="flex justify-between items-center mt-1 text-xs">
                    <span class="text-green-700"><i class="fas fa-cog mr-1"></i>${w.foDesc3 || 'N/A'}</span>
                    <span class="text-green-600">${w.workingDay || ''}</span>
                </div>
            </div>`
        ).join('') + '</div>';
    } else {
        excellentDiv.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">데이터가 없습니다</p>';
    }
    
    // Poor workers
    const poorDiv = document.getElementById('poorWorkers');
    if (poor.length > 0) {
        poorDiv.innerHTML = '<div class="space-y-2">' + poor.map(w => 
            `<div class="flex flex-col p-3 bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-orange-900">${w.workerName}</span>
                    <span class="text-orange-600 font-bold text-lg">${w.workRate.toFixed(1)}%</span>
                </div>
                <div class="flex justify-between items-center mt-1 text-xs">
                    <span class="text-orange-700"><i class="fas fa-cog mr-1"></i>${w.foDesc3 || 'N/A'}</span>
                    <span class="text-orange-600">${w.workingDay || ''}</span>
                </div>
            </div>`
        ).join('') + '</div>';
    } else {
        poorDiv.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">데이터가 없습니다</p>';
    }
    
    // Critical workers
    const criticalDiv = document.getElementById('criticalWorkers');
    if (critical.length > 0) {
        criticalDiv.innerHTML = '<div class="space-y-2">' + critical.map(w => 
            `<div class="flex flex-col p-3 bg-gradient-to-br from-red-50 to-rose-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-red-900">${w.workerName}</span>
                    <span class="text-red-600 font-bold text-lg">${w.workRate.toFixed(1)}%</span>
                </div>
                <div class="flex justify-between items-center mt-1 text-xs">
                    <span class="text-red-700"><i class="fas fa-cog mr-1"></i>${w.foDesc3 || 'N/A'}</span>
                    <span class="text-red-600">${w.workingDay || ''}</span>
                </div>
            </div>`
        ).join('') + '</div>';
    } else {
        criticalDiv.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">데이터가 없습니다</p>';
    }
}

// Update charts
function updateCharts(workerAgg, rawData) {
    updateProcessChart(workerAgg);
    updatePerformanceChart(workerAgg);
}

// Update process chart
function updateProcessChart(workerAgg) {
    const processData = {};
    
    workerAgg.forEach(item => {
        if (!processData[item.foDesc3]) {
            processData[item.foDesc3] = {
                totalMinutes: 0,
                count: 0
            };
        }
        processData[item.foDesc3].totalMinutes += item.totalMinutes;
        processData[item.foDesc3].count += 1;
    });
    
    const processes = Object.keys(processData);
    const avgWorkRates = processes.map(p => {
        const avg = (processData[p].totalMinutes / processData[p].count / 660) * 100;
        return avg.toFixed(1);
    });
    
    const ctx = document.getElementById('processChart');
    
    if (AppState.charts.process) {
        AppState.charts.process.destroy();
    }
    
    AppState.charts.process = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: processes,
            datasets: [{
                label: 'Average Work Rate (%)',
                data: avgWorkRates,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Update performance chart
function updatePerformanceChart(workerAgg) {
    const bandCounts = {
        'Excellent': 0,
        'Normal': 0,
        'Poor': 0,
        'Critical': 0
    };
    
    workerAgg.forEach(item => {
        bandCounts[item.performanceBand]++;
    });
    
    const ctx = document.getElementById('performanceChart');
    
    if (AppState.charts.performance) {
        AppState.charts.performance.destroy();
    }
    
    AppState.charts.performance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Excellent (≥80%)', 'Normal (50-80%)', 'Poor (30-50%)', 'At-Risk (<30%)'],
            datasets: [{
                data: [
                    bandCounts['Excellent'],
                    bandCounts['Normal'],
                    bandCounts['Poor'],
                    bandCounts['Critical']
                ],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Update data table
function updateDataTable(workerAgg) {
    const tbody = document.getElementById('dataTableBody');
    
    if (workerAgg.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-gray-500">No data matches the filter criteria</td></tr>';
        return;
    }
    
    tbody.innerHTML = workerAgg.map(item => {
        const bandClass = {
            'Excellent': 'badge-excellent',
            'Normal': 'badge-normal',
            'Poor': 'badge-poor',
            'Critical': 'badge-critical'
        }[item.performanceBand];
        
        const bandText = {
            'Excellent': 'Excellent',
            'Normal': 'Normal',
            'Poor': 'Poor',
            'Critical': 'At-Risk'
        }[item.performanceBand];
        
        const shiftText = item.workingShift === 'Day' ? 'Day' : 'Night';
        const actualShiftText = item.actualShift || '-';
        
        return `
            <tr>
                <td>${item.workerName}</td>
                <td>${item.foDesc3}</td>
                <td>${item.workingDay}</td>
                <td><strong>${actualShiftText}</strong></td>
                <td>${shiftText}</td>
                <td>${Math.round(item.totalMinutes)}</td>
                <td>${item.validCount}</td>
                <td><strong>${item.workRate.toFixed(1)}%</strong></td>
                <td><span class="worker-badge ${bandClass}">${bandText}</span></td>
            </tr>
        `;
    }).join('');
}

// Initialize process mapping
function initMapping() {
    document.getElementById('addMappingBtn').addEventListener('click', addMapping);
    updateMappingTable();
}

// Load default process mapping - EXACT match from Excel Process Mapping sheet
function loadDefaultProcessMapping() {
    AppState.processMapping = [
        // BT Complete Category
        { fdDesc: 'Fitup Bracket', foDesc2: 'BT Complete', foDesc3: 'Fitup Bracket', seq: 1 },
        { fdDesc: 'Flange Paint', foDesc2: 'BT Complete', foDesc3: 'Flange Paint', seq: 3 },
        { fdDesc: 'Weld Bracket', foDesc2: 'BT Complete', foDesc3: 'Weld Bracket', seq: 3 },
        { fdDesc: 'Bracket VT/MT Repair', foDesc2: 'BT Complete', foDesc3: 'Bracket VT/MT Repair', seq: 3 },
        { fdDesc: 'VT/MT Repair', foDesc2: 'BT Complete', foDesc3: 'VT/MT Repair', seq: 4 },
        { fdDesc: 'UT Repair', foDesc2: 'BT Complete', foDesc3: 'UT Repair', seq: 5 },
        { fdDesc: 'Tilt Repair', foDesc2: 'BT Complete', foDesc3: 'Tilt Repair', seq: 6 },
        { fdDesc: 'Quality Repair', foDesc2: 'BT Complete', foDesc3: 'Quality Repair', seq: 6 },
        { fdDesc: 'Flatness Repair', foDesc2: 'BT Complete', foDesc3: 'Flatness Repair', seq: 7 },
        { fdDesc: 'Harness Repair', foDesc2: 'BT Complete', foDesc3: 'Harness Repair', seq: 8 },
        { fdDesc: 'Final Polish', foDesc2: 'BT Complete', foDesc3: 'Final Polish', seq: 8 },
        { fdDesc: 'Final Repair', foDesc2: 'BT Complete', foDesc3: 'Final Repair', seq: 9 },
        
        // BT Process Category
        { fdDesc: 'Pre-Blasting', foDesc2: 'BT Process', foDesc3: 'Pre-Blasting', seq: 0 },
        { fdDesc: 'Cut', foDesc2: 'BT Process', foDesc3: 'Cut', seq: 1 },
        { fdDesc: 'LS DS+Shell 2', foDesc2: 'BT Process', foDesc3: 'LS DS+Shell 2', seq: 2 },
        { fdDesc: 'Bevel', foDesc2: 'BT Process', foDesc3: 'Bevel', seq: 3 },
        { fdDesc: 'Bend', foDesc2: 'BT Process', foDesc3: 'Bend', seq: 4 },
        { fdDesc: 'LSeam', foDesc2: 'BT Process', foDesc3: 'LSeam', seq: 6 },
        { fdDesc: 'FU-UF', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-LF', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C02', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C03', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C04', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C05', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C06', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C07', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C08', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C09', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C10', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU-C11', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'FU DS+Shell 2', foDesc2: 'BT Process', foDesc3: 'FU', seq: 8 },
        { fdDesc: 'CSO-UF', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-LF', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C02', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C03', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C04', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C05', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C06', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C07', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C08', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C09', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C10', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSO-C11', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-UF', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-LF', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C02', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C03', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C04', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C05', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C06', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C07', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C08', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C09', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C10', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        { fdDesc: 'CSI-C11', foDesc2: 'BT Process', foDesc3: 'CS', seq: 9 },
        
        // DS Category
        { fdDesc: 'DS-CUT', foDesc2: 'DS', foDesc3: 'DS-CUT', seq: 1 },
        { fdDesc: 'DS DS+Shell 2', foDesc2: 'DS', foDesc3: 'DS DS+Shell 2', seq: 2 },
        { fdDesc: 'DS-BEV', foDesc2: 'DS', foDesc3: 'DS-BEV', seq: 3 },
        { fdDesc: 'DS-BEN', foDesc2: 'DS', foDesc3: 'DS-BEN', seq: 4 },
        { fdDesc: 'DS-AN', foDesc2: 'DS', foDesc3: 'DS-AN', seq: 5 },
        
        // IM QC Category
        { fdDesc: 'QC Pre-assembly Inspection', foDesc2: 'IM QC', foDesc3: 'QC Pre-assembly Inspection', seq: 1 },
        { fdDesc: 'IM Pre-assembly Mounting', foDesc2: 'IM QC', foDesc3: 'IM Pre-assembly Mounting', seq: 1 },
        { fdDesc: 'Wash Inspection', foDesc2: 'IM QC', foDesc3: 'Wash Inspection', seq: 1 },
        { fdDesc: 'QC MT', foDesc2: 'IM QC', foDesc3: 'QC MT', seq: 1 },
        { fdDesc: 'Assembly Inspection', foDesc2: 'IM QC', foDesc3: 'Assembly Inspection', seq: 2 },
        { fdDesc: 'QC VT/MT', foDesc2: 'IM QC', foDesc3: 'QC VT/MT', seq: 3 },
        { fdDesc: 'Flatness Inspection', foDesc2: 'IM QC', foDesc3: 'Flatness Inspection', seq: 4 },
        { fdDesc: 'Final IM Inspection', foDesc2: 'IM QC', foDesc3: 'Final IM Inspection', seq: 4 },
        { fdDesc: 'Harness Inspection', foDesc2: 'IM QC', foDesc3: 'Harness Inspection', seq: 4 },
        { fdDesc: 'Final BT Inspection', foDesc2: 'IM QC', foDesc3: 'Final BT Inspection', seq: 5 },
        { fdDesc: 'Final WT Inspection', foDesc2: 'IM QC', foDesc3: 'Final WT Inspection', seq: 5 },
        
        // IM Category
        { fdDesc: 'Electrical', foDesc2: 'IM', foDesc3: 'Electrical', seq: 3 },
        { fdDesc: 'Duct Assembly', foDesc2: 'IM', foDesc3: 'Duct Assembly', seq: 3 },
        { fdDesc: 'Final Touch Up', foDesc2: 'IM', foDesc3: 'Final Touch Up', seq: 4 },
        
        // WT QC Category
        { fdDesc: 'Blasting', foDesc2: 'WT QC', foDesc3: 'Blasting Inspection', seq: 2 },
        { fdDesc: 'Blasting Inspection', foDesc2: 'WT QC', foDesc3: 'Blasting Inspection', seq: 2 },
        { fdDesc: 'Metallizing', foDesc2: 'WT QC', foDesc3: 'Metalizing Inspection', seq: 3 },
        { fdDesc: 'Metalizing Inspection', foDesc2: 'WT QC', foDesc3: 'Metalizing Inspection', seq: 3 },
        
        // WT Category
        { fdDesc: 'Wash', foDesc2: 'WT', foDesc3: 'Wash', seq: 1 },
        { fdDesc: 'Blasting(TAP)', foDesc2: 'WT', foDesc3: 'Blasting(TAP)', seq: 2 },
        { fdDesc: 'Clean', foDesc2: 'WT', foDesc3: 'Clean', seq: 4 },
        { fdDesc: 'Ring on', foDesc2: 'WT', foDesc3: 'Ring on', seq: 5 },
        { fdDesc: 'Final Cleaning', foDesc2: 'WT', foDesc3: 'Final Cleaning', seq: 6 },
        { fdDesc: 'Weight', foDesc2: 'WT', foDesc3: 'Weight', seq: 7 },
        { fdDesc: 'Paint1IO', foDesc2: 'WT', foDesc3: 'Paint1IO', seq: 8 },
        { fdDesc: 'Paint2I', foDesc2: 'WT', foDesc3: 'Paint2I', seq: 8 },
        { fdDesc: 'Paint2O', foDesc2: 'WT', foDesc3: 'Paint2O', seq: 8 },
        { fdDesc: 'Paint1 Inspection', foDesc2: 'WT', foDesc3: 'Paint1 Inspection', seq: 8 },
        { fdDesc: 'Final Paint Repair', foDesc2: 'WT', foDesc3: 'Final Paint Repair', seq: 9 },
        { fdDesc: 'Ring off', foDesc2: 'WT', foDesc3: 'Ring off', seq: 10 },
        
        // BT QC Category
        { fdDesc: 'QC UT', foDesc2: 'BT QC', foDesc3: 'QC UT', seq: 2 },
        { fdDesc: 'Ovality Repair', foDesc2: 'BT QC', foDesc3: 'Ovality Repair', seq: 6 }
    ];
    console.log(`✅ ${AppState.processMapping.length} process mappings loaded`);
    updateMappingTable();
}

// Add new mapping
function addMapping() {
    const fdDesc = document.getElementById('newFDDesc').value.trim();
    const foDesc2 = document.getElementById('newFODesc2').value.trim();
    const foDesc3 = document.getElementById('newFODesc3').value.trim();
    const seq = parseInt(document.getElementById('newSeq').value) || 999;
    
    if (!fdDesc || !foDesc3) {
        alert('FD Desc와 FO Desc 3는 필수 입력 항목입니다.');
        return;
    }
    
    // Check duplicate
    const exists = AppState.processMapping.some(m => 
        normalizeHeader(m.fdDesc) === normalizeHeader(fdDesc)
    );
    
    if (exists) {
        if (!confirm('이미 존재하는 매핑입니다. 덮어쓰시겠습니까?')) {
            return;
        }
        // Remove existing
        AppState.processMapping = AppState.processMapping.filter(m =>
            normalizeHeader(m.fdDesc) !== normalizeHeader(fdDesc)
        );
    }
    
    AppState.processMapping.push({
        fdDesc: fdDesc,
        foDesc2: foDesc2,
        foDesc3: foDesc3,
        seq: seq
    });
    
    // Clear inputs
    document.getElementById('newFDDesc').value = '';
    document.getElementById('newFODesc2').value = '';
    document.getElementById('newFODesc3').value = '';
    document.getElementById('newSeq').value = '';
    
    updateMappingTable();
    
    // Reprocess data if exists
    if (AppState.rawData.length > 0) {
        AppState.processedData = processData(AppState.rawData);
        updateReport();
    }
}

// Delete mapping
function deleteMapping(fdDesc) {
    if (!confirm('이 매핑을 삭제하시겠습니까?')) {
        return;
    }
    
    AppState.processMapping = AppState.processMapping.filter(m =>
        normalizeHeader(m.fdDesc) !== normalizeHeader(fdDesc)
    );
    
    updateMappingTable();
    
    // Reprocess data if exists
    if (AppState.rawData.length > 0) {
        AppState.processedData = processData(AppState.rawData);
        updateReport();
    }
}

// Update mapping table
function updateMappingTable() {
    const tbody = document.getElementById('mappingTableBody');
    
    if (AppState.processMapping.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-gray-500">No mapping data available</td></tr>';
        return;
    }
    
    // Sort based on current sort state
    const sorted = [...AppState.processMapping].sort((a, b) => {
        const column = AppState.mappingSort.column;
        const ascending = AppState.mappingSort.ascending;
        
        let valA = a[column];
        let valB = b[column];
        
        // Handle numeric comparison for seq
        if (column === 'seq') {
            valA = parseInt(valA) || 0;
            valB = parseInt(valB) || 0;
        } else {
            // String comparison (case-insensitive)
            valA = (valA || '').toString().toLowerCase();
            valB = (valB || '').toString().toLowerCase();
        }
        
        if (valA < valB) return ascending ? -1 : 1;
        if (valA > valB) return ascending ? 1 : -1;
        return 0;
    });
    
    tbody.innerHTML = sorted.map(mapping => `
        <tr>
            <td>${mapping.fdDesc}</td>
            <td>${mapping.foDesc2}</td>
            <td>${mapping.foDesc3}</td>
            <td>${mapping.seq}</td>
            <td>
                <button class="text-red-600 hover:text-red-800" onclick="deleteMapping('${mapping.fdDesc}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Sort mapping table
function sortMappingTable(column) {
    // If clicking the same column, toggle direction
    if (AppState.mappingSort.column === column) {
        AppState.mappingSort.ascending = !AppState.mappingSort.ascending;
    } else {
        // New column, default to ascending
        AppState.mappingSort.column = column;
        AppState.mappingSort.ascending = true;
    }
    
    updateMappingTable();
    
    // Update sort icons
    updateMappingSortIcons();
}

// Update sort icons in table headers
function updateMappingSortIcons() {
    const headers = document.querySelectorAll('#mappingTable th');
    const columnMap = {
        0: 'fdDesc',
        1: 'foDesc2',
        2: 'foDesc3',
        3: 'seq'
    };
    
    headers.forEach((th, index) => {
        const icon = th.querySelector('i');
        if (!icon) return;
        
        const column = columnMap[index];
        if (column === AppState.mappingSort.column) {
            // Active column
            if (AppState.mappingSort.ascending) {
                icon.className = 'fas fa-sort-up text-blue-600';
            } else {
                icon.className = 'fas fa-sort-down text-blue-600';
            }
        } else {
            // Inactive column
            icon.className = 'fas fa-sort text-gray-400';
        }
    });
}

// JSON Import/Export
function initJsonImportExport() {
    document.getElementById('exportJsonBtn').addEventListener('click', exportToJson);
    document.getElementById('importJsonBtn').addEventListener('click', () => {
        document.getElementById('jsonFileInput').click();
    });
    
    document.getElementById('jsonFileInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importFromJson(e.target.files[0]);
        }
    });
}

// Export to JSON
function exportToJson() {
    const exportData = {
        version: '1.1',
        exportDate: new Date().toISOString(),
        rawData: AppState.rawData,
        processedData: AppState.processedData,
        processMapping: AppState.processMapping,
        shiftCalendar: AppState.shiftCalendar
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const filename = `MES_Report_${new Date().toISOString().split('T')[0]}.json`;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log('✅ JSON file exported successfully:', filename);
}

// Import from JSON
function importFromJson(file) {
    showUploadStatus(true);
    updateProgress(10);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            updateProgress(30);
            const importData = JSON.parse(e.target.result);
            
            updateProgress(50);
            
            // Validate structure
            if (!importData.rawData || !importData.processedData || !importData.processMapping) {
                throw new Error('Invalid JSON file format. Required: rawData, processedData, processMapping.');
            }
            
            updateProgress(70);
            
            // Restore data
            AppState.rawData = importData.rawData;
            AppState.processedData = importData.processedData;
            AppState.processMapping = importData.processMapping;
            AppState.shiftCalendar = importData.shiftCalendar || [];
            
            updateProgress(90);
            
            // Update UI
            updateMappingTable();
            showUploadResult(AppState.processedData);
            updateReport();
            
            document.getElementById('exportJsonBtn').disabled = false;
            
            updateProgress(100);
            
            console.log('✅ JSON file imported successfully');
            
            setTimeout(() => {
                showUploadStatus(false);
                // Switch to report tab
                document.querySelector('[data-tab="report"]').click();
            }, 500);
            
        } catch (error) {
            console.error('JSON import error:', error);
            alert('Error loading JSON file:\n' + error.message);
            showUploadStatus(false);
        }
    };
    
    reader.onerror = function() {
        alert('Error reading file.');
        showUploadStatus(false);
    };
    
    reader.readAsText(file);
}



// Initialize view toggle
function initViewToggle() {
    const toggleBtn = document.getElementById('toggleViewBtn');
    const toggleBtn2 = document.getElementById('toggleViewBtn2');
    let showingPivot = true;
    
    function switchView() {
        const pivotCard = document.querySelector('#pivotReportView').closest('.card');
        const detailCard = document.querySelector('#dataTable').closest('.card');
        
        if (showingPivot) {
            // Switch to detail view
            pivotCard.style.display = 'none';
            detailCard.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-exchange-alt mr-1"></i>Switch to Date Report';
            showingPivot = false;
        } else {
            // Switch to pivot view
            pivotCard.style.display = 'block';
            detailCard.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-exchange-alt mr-1"></i>Switch to Detail View';
            showingPivot = true;
        }
    }
    
    toggleBtn.addEventListener('click', switchView);
    toggleBtn2.addEventListener('click', switchView);
    
    // Hide detail view by default
    document.querySelector('#dataTable').closest('.card').style.display = 'none';
}

// Render shift calendar (February-April 2026)
function renderShiftCalendar(year = 2026, month = 2) {
    const grid = document.getElementById('shiftCalendarGrid');
    const title = document.getElementById('calendarMonthTitle');
    if (!grid) return;
    
    // Month names
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Update title
    if (title) {
        title.textContent = `${monthNames[month]} ${year}`;
    }
    
    // Calculate first day and days in month
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // Shift colors
    const shiftColors = {
        'A': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        'B': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'C': 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        '': '#e5e7eb'
    };
    
    let html = '';
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        html += '<div class="aspect-square"></div>';
    }
    
    // Add calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const shiftData = AppState.shiftCalendar.find(s => s.date === dateStr);
        
        const dayShift = shiftData ? shiftData.dayShift : '';
        const nightShift = shiftData ? shiftData.nightShift : '';
        
        // Create day cell with split colors
        html += `
            <div class="aspect-square bg-white rounded border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer relative group">
                <div class="text-center pt-1">
                    <div class="text-xs font-semibold text-gray-700">${day}</div>
                </div>
                <div class="flex h-full">
                    <div class="w-1/2 flex items-center justify-center text-xs font-bold text-white" 
                         style="background: ${shiftColors[dayShift]}; clip-path: polygon(0 0, 100% 0, 0 100%);">
                        ${dayShift ? '<span class="absolute left-1 bottom-1 text-shadow">' + dayShift + '</span>' : ''}
                    </div>
                    <div class="w-1/2 flex items-center justify-center text-xs font-bold text-white" 
                         style="background: ${shiftColors[nightShift]}; clip-path: polygon(100% 0, 100% 100%, 0 100%);">
                        ${nightShift ? '<span class="absolute right-1 bottom-1 text-shadow">' + nightShift + '</span>' : ''}
                    </div>
                </div>
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all pointer-events-none"></div>
            </div>
        `;
    }
    
    grid.innerHTML = html;
    
    // Update month button highlights
    updateMonthButtonHighlight(month);
}

// Update month button highlight
function updateMonthButtonHighlight(month) {
    const buttons = {
        2: document.getElementById('calendarFeb'),
        3: document.getElementById('calendarMar'),
        4: document.getElementById('calendarApr')
    };
    
    Object.entries(buttons).forEach(([m, btn]) => {
        if (btn) {
            if (parseInt(m) === month) {
                btn.className = 'px-3 py-1 text-sm bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 transition font-semibold';
            } else {
                btn.className = 'px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition';
            }
        }
    });
}

// Initialize calendar navigation
function initCalendarNavigation() {
    let currentMonth = 2; // February
    const currentYear = 2026;
    
    // Month buttons
    document.getElementById('calendarFeb')?.addEventListener('click', () => {
        currentMonth = 2;
        renderShiftCalendar(currentYear, currentMonth);
    });
    
    document.getElementById('calendarMar')?.addEventListener('click', () => {
        currentMonth = 3;
        renderShiftCalendar(currentYear, currentMonth);
    });
    
    document.getElementById('calendarApr')?.addEventListener('click', () => {
        currentMonth = 4;
        renderShiftCalendar(currentYear, currentMonth);
    });
    
    // Prev/Next buttons
    document.getElementById('calendarPrevMonth')?.addEventListener('click', () => {
        if (currentMonth > 2) {
            currentMonth--;
            renderShiftCalendar(currentYear, currentMonth);
        }
    });
    
    document.getElementById('calendarNextMonth')?.addEventListener('click', () => {
        if (currentMonth < 4) {
            currentMonth++;
            renderShiftCalendar(currentYear, currentMonth);
        }
    });
}

// Save data to database
async function saveToDatabase(filename, fileSize) {
    try {
        console.log('💾 Saving data to database...');
        
        const payload = {
            filename: filename,
            fileSize: fileSize,
            rawData: AppState.rawData,
            processedData: AppState.processedData,
            processMapping: AppState.processMapping,
            shiftCalendar: AppState.shiftCalendar
        };
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Data saved successfully!', result);
            console.log(`📊 Upload ID: ${result.uploadId}`);
            console.log(`📈 Stats:`, result.stats);
        } else {
            console.error('❌ Save failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Failed to save to database:', error);
        // Don't show alert - just log the error
        // User can still use the app even if DB save fails
    }
}

// Make globally accessible functions
window.deleteMapping = deleteMapping;
window.sortMappingTable = sortMappingTable;
window.toggleCheckboxDropdown = toggleCheckboxDropdown;
window.updateCheckboxDisplay = updateCheckboxDisplay;
