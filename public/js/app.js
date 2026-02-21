// MES Individual Performance Report Application
// Main application logic
// Version: 3.0.0 - Two Metric System (Time Utilization & Work Efficiency)

// Category order for sorting
const CATEGORY_ORDER = {
    'BT Process': 1,
    'DS': 2,
    'BT Complete': 3,
    'BT QC': 4,
    'WT': 5,
    'WT QC': 6,
    'IM': 7,
    'IM QC': 8,
    'Other': 999
};

// Global state
const AppState = {
    rawData: [],
    processedData: [],
    processMapping: [],
    shiftCalendar: [],
    currentFileName: '',
    currentFileSize: 0,
    allWorkers: [], // For worker search functionality
    currentMetricType: 'utilization', // 'utilization' or 'efficiency'
    outlierThreshold: 1000, // ✅ Filter out rates > 1000% (configurable)
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
    },
    filteredData: null, // ✅ Store filtered data separately
    workerSummary: null, // ✅ Store aggregated worker summary
    cachedWorkerAgg: null, // ✅ Cache for search/sort
    dataTableSort: { column: null, order: 'desc' } // ✅ Sort state
};

// Header normalization and synonym dictionary
const HEADER_SYNONYMS = {
    'workername': ['workername', 'worker', 'worker_name'],
    'fodesc': ['fodesc', 'fo_desc', 'fddesc', 'fd_desc'],
    'startdatetime': ['startdatetime', 'start_datetime', 'start_dt', 'startdt'],
    'enddatetime': ['enddatetime', 'end_datetime', 'end_dt', 'enddt'],
    'workeract': ['workeract', 'worker_act', 'workeractmins', 'workeractmin', 'worker_act_mins'],
    'resultcnt': ['resultcnt', 'result_cnt', 'resultcount'],
    'sectionid': ['sectionid', 'section_id', 'sectionno'],
    'workerst': ['workerst', 'worker_st', 'workerstandard', 'worker_standard_time', 'st', 'standardtime'],
    'workerrate': ['workerrate', 'worker_rate', 'workerratepct', 'rate', 'ratepct'],
    'rework': ['rework', 're_work', 'reworkflag']
};

// Normalize header text
function normalizeHeader(header) {
    if (!header) return '';
    return header.toString()
        .trim()
        .toUpperCase()
        .replace(/[\s_\-*\/()%]/g, '');  // Add / and % to the regex
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
        initDatabaseButtons();
        console.log('✅ Database buttons initialized');
        initViewToggle();
        console.log('✅ View toggle initialized');
        
        // ✅ NEW: Outlier threshold control
        document.getElementById('applyThresholdBtn')?.addEventListener('click', () => {
            const input = document.getElementById('outlierThresholdInput');
            const value = parseInt(input.value) || 1000;
            AppState.outlierThreshold = value;
            console.log(`🎯 Outlier threshold updated: ${value}%`);
            updateReport();
        });
        
        // ✅ NEW: Worker search
        let searchTimeout;
        document.getElementById('workerSearchInput')?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterDataTableByWorker(e.target.value);
            }, 300);
        });
        
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
            switchTab(targetTab);
        });
    });
}

// Switch to a specific tab
function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Update active tab button
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('tab-active');
        } else {
            btn.classList.remove('tab-active');
        }
    });
    
    // Show target tab content
    tabContents.forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tabName + 'Tab')?.classList.remove('hidden');
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
    // Check if it's an Excel file
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
        alert('Excel (.xlsx, .xls) files only.');
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
                throw new Error("No data found in Raw sheet.");
            }
            
            updateProgress(70);
            
            // Parse and process data
            const headers = rawData[0];
            const dataRows = rawData.slice(1);
            
            // LOG ALL HEADERS IMMEDIATELY FOR DEBUGGING
            console.log('\n' + '='.repeat(80));
            console.log('📋 EXCEL HEADERS FROM FILE (Total: ' + headers.length + '):');
            console.log('='.repeat(80));
            headers.forEach((h, i) => {
                console.log(`[${i.toString().padStart(2, ' ')}] "${h}"`);
            });
            console.log('='.repeat(80) + '\n');
            
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
            
            // Store filename and size for later database save
            AppState.currentFileName = file.name;
            AppState.currentFileSize = file.size;
            
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
    
    // Log all headers for debugging
    console.log('📋 Excel headers (raw):', headers);
    console.log('📋 Excel headers (normalized):', headers.map(h => normalizeHeader(h)));
    
    // Find column indices
    const colWorkerName = findColumnIndex(headers, 'workername');
    const colFODesc = findColumnIndex(headers, 'fodesc');
    const colStartDt = findColumnIndex(headers, 'startdatetime');
    const colEndDt = findColumnIndex(headers, 'enddatetime');
    const colWorkerAct = findColumnIndex(headers, 'workeract');
    const colResultCnt = findColumnIndex(headers, 'resultcnt');
    const colSectionId = findColumnIndex(headers, 'sectionid');
    const colWorkerST = findColumnIndex(headers, 'workerst');
    const colWorkerRate = findColumnIndex(headers, 'workerrate');
    const colRework = findColumnIndex(headers, 'rework');
    
    console.log('📊 Column indices:', {
        workerName: colWorkerName,
        workerST: colWorkerST,
        workerRate: colWorkerRate,
        workerAct: colWorkerAct,
        rework: colRework
    });
    
    dataRows.forEach((row, index) => {
        if (!row || row.length === 0) return;
        
        const workerName = row[colWorkerName];
        if (!workerName) return; // Skip empty rows
        
        // Parse Rework flag
        let reworkFlag = false;
        if (colRework !== -1) {
            const reworkValue = row[colRework];
            if (reworkValue === true || reworkValue === 'true' || reworkValue === 'True' || 
                reworkValue === 'TRUE' || reworkValue === 1 || reworkValue === '1') {
                reworkFlag = true;
            }
        }
        
        const record = {
            rowIndex: index + 2, // Excel row (1-indexed + header)
            sectionId: colSectionId !== -1 ? row[colSectionId] : `ROW_${index + 2}`,
            workerName: workerName,
            fdDesc: row[colFODesc] || '',
            startDatetime: colStartDt !== -1 ? parseExcelDate(row[colStartDt]) : null,
            endDatetime: colEndDt !== -1 ? parseExcelDate(row[colEndDt]) : null,
            workerAct: parseFloat(row[colWorkerAct]) || 0, // Original Worker Act
            workerActMins: parseFloat(row[colWorkerAct]) || 0, // Will be adjusted by overlap removal
            workerST: colWorkerST !== -1 ? parseFloat(row[colWorkerST]) || 0 : 0, // Worker Standard Time
            'Worker S/T': colWorkerST !== -1 ? parseFloat(row[colWorkerST]) || 0 : 0, // Alternative key
            'Worker Act': parseFloat(row[colWorkerAct]) || 0, // Alternative key for efficiency calculation
            workerRate: colWorkerRate !== -1 ? parseFloat(row[colWorkerRate]) || 0 : 0, // Worker Rate (%)
            'Worker Rate(%)': colWorkerRate !== -1 ? parseFloat(row[colWorkerRate]) || 0 : 0, // Alternative key
            rework: reworkFlag, // Rework flag
            resultCnt: row[colResultCnt]
        };
        
        parsed.push(record);
    });
    
    console.log(`📊 Parsed ${parsed.length} records (Rework excluded: ${parsed.filter(r => r.rework).length})`);
    
    // Debug: Show first 3 records with S/T and Rate values
    if (parsed.length > 0) {
        console.log('🔍 Sample parsed records (first 3):', parsed.slice(0, 3).map(r => ({
            worker: r.workerName,
            workerST: r.workerST,
            'Worker S/T': r['Worker S/T'],
            workerRate: r.workerRate,
            'Worker Rate(%)': r['Worker Rate(%)'],
            workerAct: r.workerAct
        })));
    }
    
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

// Merge overlapping time intervals for each worker
function mergeOverlappingIntervals(records) {
    if (!records || records.length === 0) return records;
    
    console.log(`⏱️  Checking for overlapping time intervals...`);
    
    // Group records by worker
    const recordsByWorker = {};
    records.forEach(record => {
        const worker = record.workerName;
        if (!worker) return;
        
        if (!recordsByWorker[worker]) {
            recordsByWorker[worker] = [];
        }
        recordsByWorker[worker].push(record);
    });
    
    let totalOverlaps = 0;
    let totalOverlapMinutes = 0;
    
    // Process each worker's records
    Object.keys(recordsByWorker).forEach(worker => {
        const workerRecords = recordsByWorker[worker];
        
        // Extract time intervals with their record indices
        const intervals = [];
        workerRecords.forEach((record, idx) => {
            if (record.startDatetime && record.endDatetime) {
                const start = record.startDatetime instanceof Date ? record.startDatetime : new Date(record.startDatetime);
                const end = record.endDatetime instanceof Date ? record.endDatetime : new Date(record.endDatetime);
                
                if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start < end) {
                    intervals.push({
                        start: start,
                        end: end,
                        recordIdx: idx,
                        originalMinutes: (end - start) / 60000
                    });
                }
            }
        });
        
        if (intervals.length <= 1) return; // No overlaps possible
        
        // Sort intervals by start time
        intervals.sort((a, b) => a.start - b.start);
        
        // Detect and merge overlapping intervals
        const merged = [];
        let current = intervals[0];
        const overlappingGroups = [[current.recordIdx]]; // Track which records belong to each merged interval
        
        for (let i = 1; i < intervals.length; i++) {
            const next = intervals[i];
            
            // Check if current and next overlap
            if (current.end > next.start) {
                // Overlap detected!
                const overlapStart = next.start;
                const overlapEnd = current.end < next.end ? current.end : next.end;
                const overlapMinutes = (overlapEnd - overlapStart) / 60000;
                
                totalOverlaps++;
                totalOverlapMinutes += overlapMinutes;
                
                // Merge: extend current interval
                current.end = current.end > next.end ? current.end : next.end;
                overlappingGroups[overlappingGroups.length - 1].push(next.recordIdx);
            } else {
                // No overlap, start new interval
                merged.push(current);
                current = next;
                overlappingGroups.push([next.recordIdx]);
            }
        }
        merged.push(current); // Add the last interval
        
        // Calculate adjusted workerActMins for each record
        merged.forEach((interval, mergedIdx) => {
            const recordIndices = overlappingGroups[mergedIdx];
            const mergedMinutes = (interval.end - interval.start) / 60000;
            
            // Distribute merged time equally among overlapping records
            const adjustedMinutes = mergedMinutes / recordIndices.length;
            
            recordIndices.forEach(recordIdx => {
                const record = workerRecords[recordIdx];
                const originalMinutes = record.workerActMins || 0;
                record.workerActMins = adjustedMinutes;
                record.originalWorkerActMins = originalMinutes; // Keep original for reference
                record.overlapAdjusted = recordIndices.length > 1; // Flag if adjusted
            });
        });
    });
    
    if (totalOverlaps > 0) {
        console.log(`⚠️  Found ${totalOverlaps} overlapping intervals`);
        console.log(`📉 Total overlap time removed: ${totalOverlapMinutes.toFixed(1)} minutes`);
    } else {
        console.log(`✅ No overlapping intervals found`);
    }
    
    return records;
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
            console.log(`  [${idx+1}] Worker: ${r.workerName}, Process: ${r.foDesc3}, Category: ${r.foDesc2}`);
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
    
    // Merge overlapping time intervals for each worker
    mergeOverlappingIntervals(processed);
    
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
    
    // Note: Shift filter is now handled by radio buttons with updateSingleSelect
}

// Handle shift filter change
function onShiftFilterChange() {
    const selectedShift = getRadioValue('shift');
    updateWorkingDayOptions(selectedShift);
}

// Update working day options based on selected shift
function updateWorkingDayOptions(selectedShift) {
    const dropdown = document.getElementById('filterWorkingDayDropdown');
    
    if (!dropdown) return;
    
    let availableDates = [];
    
    if (!selectedShift) {
        // Show all dates
        availableDates = [...new Set(AppState.processedData.map(d => d.workingDay))].filter(d => d).sort();
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
        
        availableDates = [...relevantDates].sort();
    }
    
    if (availableDates.length === 0) {
        dropdown.innerHTML = '<div class="px-3 py-2 text-sm text-gray-500">No working days available</div>';
        return;
    }
    
    // Group dates by week and month
    const datesByMonth = {};
    const datesByWeek = {};
    
    availableDates.forEach(date => {
        const month = date.substring(0, 7); // YYYY-MM
        if (!datesByMonth[month]) {
            datesByMonth[month] = [];
        }
        datesByMonth[month].push(date);
        
        // Calculate week number (ISO week)
        const d = new Date(date);
        const dayOfWeek = d.getDay() || 7; // Sunday = 7
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - dayOfWeek + 1); // Monday of the week
        const weekKey = weekStart.toISOString().substring(0, 10);
        
        if (!datesByWeek[weekKey]) {
            datesByWeek[weekKey] = [];
        }
        datesByWeek[weekKey].push(date);
    });
    
    // Generate HTML with month and week groups
    let html = '<div class="p-2">';
    
    // Month group buttons
    html += '<div class="mb-2 pb-2 border-b border-gray-200">';
    html += '<div class="text-xs font-semibold text-gray-500 mb-1 px-1">BY MONTH:</div>';
    html += '<div class="flex flex-wrap gap-2">';
    Object.keys(datesByMonth).forEach(month => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthName = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        html += `
            <button onclick="selectAllMonthDates('${month}', true)" class="px-3 py-1.5 text-xs bg-blue-100 hover:bg-blue-600 hover:text-white text-blue-700 rounded font-medium transition-all active:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md">
                ${monthName}
            </button>
        `;
    });
    html += '</div></div>';
    
    // Week group buttons
    const sortedWeeks = Object.keys(datesByWeek).sort();
    if (sortedWeeks.length > 0) {
        html += '<div class="mb-2 pb-2 border-b border-gray-200">';
        html += '<div class="text-xs font-semibold text-gray-500 mb-1 px-1">BY WEEK:</div>';
        html += '<div class="flex flex-wrap gap-2">';
        sortedWeeks.forEach((weekStart, index) => {
            const dates = datesByWeek[weekStart].sort();
            const weekEnd = dates[dates.length - 1];
            
            // Calculate ISO week number
            const d = new Date(weekStart);
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const weekNum = Math.ceil((((d - yearStart) / 86400000) + yearStart.getDay() + 1) / 7);
            
            const weekLabel = `WK${weekNum}: ${weekStart.substring(5)} ~ ${weekEnd.substring(5)}`;
            const weekDatesStr = dates.join(',');
            html += `
                <button onclick="selectWeekDates('${weekDatesStr}')" class="px-3 py-1.5 text-xs bg-green-100 hover:bg-green-600 hover:text-white text-green-700 rounded font-medium transition-all active:bg-green-700 active:scale-95 shadow-sm hover:shadow-md">
                    ${weekLabel}
                </button>
            `;
        });
        html += '</div></div>';
    }
    
    // Date checkboxes grouped by month
    Object.keys(datesByMonth).sort().forEach(month => {
        const [year, monthNum] = month.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = `${monthNames[parseInt(monthNum) - 1]} ${year}`;
        html += `
            <div class="mb-3">
                <div class="flex items-center justify-between px-1 py-1 mb-1">
                    <span class="text-xs font-semibold text-gray-700">${monthName}</span>
                    <div class="flex gap-1">
                        <button onclick="selectAllMonthDates('${month}', true)" class="text-xs text-blue-600 hover:text-blue-800 font-medium">All</button>
                        <span class="text-xs text-gray-400">|</span>
                        <button onclick="selectAllMonthDates('${month}', false)" class="text-xs text-gray-600 hover:text-gray-800">Clear</button>
                    </div>
                </div>
                <div class="month-dates space-y-0.5" data-month="${month}">
        `;
        
        datesByMonth[month].forEach(date => {
            html += `
                <label class="flex items-center px-2 py-1.5 hover:bg-blue-50 cursor-pointer rounded">
                    <input type="checkbox" value="${date}" class="mr-2 h-4 w-4 text-blue-600 workingDay-checkbox" data-month="${month}" onchange="updateCheckboxDisplay('workingDay')">
                    <span class="text-sm text-gray-700">${date}</span>
                </label>
            `;
        });
        
        html += '</div></div>';
    });
    
    html += '</div>';
    dropdown.innerHTML = html;
}

// Update filter options
function updateFilterOptions() {
    const data = AppState.processedData;
    
    console.log(`🔧 Updating filter options with ${data.length} records`);
    
    // Update working day options based on current shift filter
    const selectedShift = getRadioValue('shift');
    updateWorkingDayOptions(selectedShift);
    
    // Save currently checked items BEFORE updating
    const checkedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value);
    const checkedProcesses = Array.from(document.querySelectorAll('.process-checkbox:checked')).map(cb => cb.value);
    const checkedWorkers = Array.from(document.querySelectorAll('.worker-checkbox:checked')).map(cb => cb.value);
    
    // Category (FO Desc 2) - Sort by category order
    const uniqueCategories = [...new Set(data.map(d => d.foDesc2))]
        .filter(c => c)
        .sort((a, b) => {
            const orderA = CATEGORY_ORDER[a] || 999;
            const orderB = CATEGORY_ORDER[b] || 999;
            return orderA - orderB;
        });
    console.log(`📂 Found ${uniqueCategories.length} unique categories (sorted by order):`, uniqueCategories);
    
    const categoryDropdown = document.getElementById('filterCategoryDropdown');
    if (categoryDropdown) {
        categoryDropdown.innerHTML = uniqueCategories.map(category => `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                <input type="checkbox" value="${category}" class="mr-3 h-4 w-4 text-blue-600 category-checkbox" onchange="updateCheckboxDisplay('category')" ${checkedCategories.includes(category) ? 'checked' : ''}>
                <span class="text-sm text-gray-700">${category}</span>
            </label>
        `).join('');
    }
    console.log(`✅ Category dropdown updated with ${uniqueCategories.length} options`);
    
    // Process (FO Desc 3) - Show all processes sorted by FO Desc 2 category order, then by Seq
    const processMap = new Map();
    data.forEach(d => {
        if (d.foDesc3 && !processMap.has(d.foDesc3)) {
            const categorySeq = CATEGORY_ORDER[d.foDesc2] || 999;
            const processSeq = d.seq !== undefined ? d.seq : 999;
            processMap.set(d.foDesc3, {
                category: d.foDesc2,
                categorySeq: categorySeq,
                processSeq: processSeq
            });
        }
    });
    
    const processes = Array.from(processMap.entries())
        .sort((a, b) => {
            // First sort by category order
            if (a[1].categorySeq !== b[1].categorySeq) {
                return a[1].categorySeq - b[1].categorySeq;
            }
            // Then sort by process seq
            if (a[1].processSeq !== b[1].processSeq) {
                return a[1].processSeq - b[1].processSeq;
            }
            // Finally sort alphabetically
            return a[0].localeCompare(b[0]);
        })
        .map(entry => entry[0]);
    
    const processDropdown = document.getElementById('filterProcessDropdown');
    if (processDropdown) {
        processDropdown.innerHTML = processes.map(process => `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                <input type="checkbox" value="${process}" class="mr-3 h-4 w-4 text-blue-600 process-checkbox" onchange="updateCheckboxDisplay('process')" ${checkedProcesses.includes(process) ? 'checked' : ''}>
                <span class="text-sm text-gray-700">${process}</span>
            </label>
        `).join('');
    }
    
    // Worker - Store workers globally for search
    const uniqueWorkers = [...new Set(data.map(d => d.workerName))].filter(w => w).sort();
    AppState.allWorkers = uniqueWorkers; // Store for search functionality
    
    const workerList = document.getElementById('filterWorkerList');
    if (workerList) {
        workerList.innerHTML = uniqueWorkers.map(worker => `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 worker-item">
                <input type="checkbox" value="${worker}" class="mr-3 h-4 w-4 text-blue-600 worker-checkbox" onchange="updateCheckboxDisplay('worker')" ${checkedWorkers.includes(worker) ? 'checked' : ''}>
                <span class="text-sm text-gray-700">${worker}</span>
            </label>
        `).join('');
    }
    
    // Restore checkbox displays
    updateCheckboxDisplay('category');
    updateCheckboxDisplay('process');
    updateCheckboxDisplay('worker');
}

// Toggle checkbox dropdown
function toggleCheckboxDropdown(type) {
    const dropdown = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`);
    if (dropdown) {
        dropdown.classList.toggle('hidden');
        
        // Clear and focus search input when opening worker dropdown
        if (type === 'worker' && !dropdown.classList.contains('hidden')) {
            const searchInput = document.getElementById('workerSearchInput');
            if (searchInput) {
                searchInput.value = '';
                filterWorkerList(); // Reset filter
                setTimeout(() => searchInput.focus(), 100);
            }
        }
    }
    
    // Close other dropdowns
    const types = ['shift', 'workingDay', 'workingShift', 'category', 'process', 'worker'];
    types.forEach(t => {
        if (t !== type) {
            const otherDropdown = document.getElementById(`filter${t.charAt(0).toUpperCase() + t.slice(1)}Dropdown`);
            if (otherDropdown) {
                otherDropdown.classList.add('hidden');
            }
        }
    });
}

// Update single select filter (for Shift and Working Shift)
function updateSingleSelect(type, value) {
    const displayButton = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}Display`);
    const dropdown = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}Dropdown`);
    
    if (displayButton) {
        const span = displayButton.querySelector('span');
        if (span) {
            if (value === '') {
                span.textContent = 'All';
                span.className = 'text-gray-500';
            } else {
                if (type === 'shift') {
                    span.textContent = `${value} Shift`;
                } else if (type === 'workingShift') {
                    span.textContent = value;
                }
                span.className = 'text-gray-900';
            }
        }
    }
    
    // Close dropdown
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
}

// Get radio button value
function getRadioValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : '';
}

// Filter worker list based on search input
function filterWorkerList() {
    const searchInput = document.getElementById('workerSearchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const workerItems = document.querySelectorAll('.worker-item');
    
    workerItems.forEach(item => {
        const workerName = item.textContent.toLowerCase();
        if (workerName.includes(searchTerm)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

// Select/deselect all dates in a month
function selectAllMonthDates(month, select) {
    const checkboxes = document.querySelectorAll(`.workingDay-checkbox[data-month="${month}"]`);
    checkboxes.forEach(cb => {
        cb.checked = select;
    });
    updateCheckboxDisplay('workingDay');
    
    // Close dropdown after selection (only if selecting, not clearing)
    if (select) {
        const dropdown = document.getElementById('filterWorkingDayDropdown');
        if (dropdown) {
            dropdown.classList.add('hidden');
        }
    }
}

// Select week dates
function selectWeekDates(weekDatesStr) {
    const weekDates = weekDatesStr.split(',');
    const allCheckboxes = document.querySelectorAll('.workingDay-checkbox');
    
    // First, uncheck all
    allCheckboxes.forEach(cb => cb.checked = false);
    
    // Then check only the week dates
    allCheckboxes.forEach(cb => {
        if (weekDates.includes(cb.value)) {
            cb.checked = true;
        }
    });
    
    updateCheckboxDisplay('workingDay');
    
    // Close dropdown after selection
    const dropdown = document.getElementById('filterWorkingDayDropdown');
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
}

// Toggle month visibility (collapse/expand)
function toggleMonthDates(month) {
    const monthDiv = document.querySelector(`.month-dates[data-month="${month}"]`);
    if (monthDiv) {
        monthDiv.classList.toggle('hidden');
    }
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
    // Get checked working days
    const dayCheckboxes = document.querySelectorAll('.workingDay-checkbox:checked');
    const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value).filter(v => v);
    
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
        shift: getRadioValue('shift'),
        workingDays: selectedDays,
        workingShift: getRadioValue('workingShift'),
        categories: selectedCategories,
        processes: selectedProcesses,
        workers: selectedWorkers
    };
    
    console.log('🎯 Applied filters:', AppState.filters);
    
    // Close all dropdowns after applying filters
    document.getElementById('filterWorkingDayDropdown')?.classList.add('hidden');
    document.getElementById('filterCategoryDropdown')?.classList.add('hidden');
    document.getElementById('filterProcessDropdown')?.classList.add('hidden');
    document.getElementById('filterWorkerDropdown')?.classList.add('hidden');
    document.getElementById('filterWorkingShiftDropdown')?.classList.add('hidden');
    
    updateReport();
}

// Reset filters
function resetFilters() {
    // Reset radio buttons
    const shiftRadio = document.querySelector('input[name="shift"][value=""]');
    if (shiftRadio) shiftRadio.checked = true;
    updateSingleSelect('shift', '');
    
    const workingShiftRadio = document.querySelector('input[name="workingShift"][value=""]');
    if (workingShiftRadio) workingShiftRadio.checked = true;
    updateSingleSelect('workingShift', '');
    
    // Uncheck all checkboxes
    document.querySelectorAll('.workingDay-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.category-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.process-checkbox').forEach(cb => cb.checked = false);
    document.querySelectorAll('.worker-checkbox').forEach(cb => cb.checked = false);
    
    // Reset displays
    updateCheckboxDisplay('workingDay');
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
    
    // Store filtered data in AppState for use in Worker Detail modal
    AppState.filteredData = filteredData;
    
    // Aggregate by worker (detailed: worker+date+shift+process)
    const workerAgg = aggregateByWorker(filteredData);
    
    // ✅ Cache for search/sort
    AppState.cachedWorkerAgg = workerAgg;
    
    // Aggregate by worker only (for Performance Bands and Charts)
    const workerSummary = aggregateByWorkerOnly(workerAgg);
    
    updateKPIs(workerSummary); // ✅ FIXED: Use workerSummary instead of workerAgg
    updatePerformanceBands(workerSummary); // Use worker summary for bands
    updateCharts(workerSummary, filteredData); // Use worker summary for charts
    updateDataTable(workerAgg);
    updatePivotReport(workerAgg);
}

// Aggregate by worker only (consolidate all records per worker)
function aggregateByWorkerOnly(workerAgg) {
    // ✅ FIX: Use workerAgg directly instead of re-processing original data
    // This ensures outliers already filtered in aggregateByWorker() stay filtered
    const byWorker = {};
    
    console.log(`📊 aggregateByWorkerOnly: Processing ${workerAgg.length} pre-aggregated records`);
    
    // Process pre-aggregated workerAgg data
    workerAgg.forEach(item => {
        const workerName = item.workerName;
        
        // ✅ Skip outliers for KPI/Chart calculations
        if (item.isOutlier) {
            return;
        }
        
        if (!byWorker[workerName]) {
            byWorker[workerName] = {
                workerName: workerName,
                totalMinutes: 0, // For Time Utilization (overlap-removed)
                totalMinutesOriginal: 0, // For Work Efficiency (original Worker Act)
                assignedStandardTime: 0, // For Work Efficiency
                validCount: 0,
                foDesc3: '', // Will be set from primary process
                workingDay: '', // Will be set from latest working day
                recordCount: 0,
                shifts: new Set(), // Track unique shifts
                processTimes: {}, // Track time per process
                foDesc2: item.foDesc2 // Category for ordering
            };
        }
        
        // Accumulate metrics from pre-aggregated data
        byWorker[workerName].totalMinutes += item.totalMinutes || 0;
        byWorker[workerName].totalMinutesOriginal += item.totalMinutesOriginal || 0;
        byWorker[workerName].assignedStandardTime += item.assignedStandardTime || 0;
        byWorker[workerName].validCount += item.validCount || 0;
        byWorker[workerName].recordCount += 1;
        
        // Track shifts
        const shiftKey = `${item.workingDay}_${item.workingShift}`;
        byWorker[workerName].shifts.add(shiftKey);
        
        // Track time per process
        if (item.foDesc3) {
            if (!byWorker[workerName].processTimes[item.foDesc3]) {
                byWorker[workerName].processTimes[item.foDesc3] = 0;
            }
            byWorker[workerName].processTimes[item.foDesc3] += item.totalMinutes || 0;
        }
        
        // Keep latest working day
        if (item.workingDay) {
            byWorker[workerName].workingDay = item.workingDay;
        }
    });
    
    console.log(`📊 Worker Summary:
    - Workers aggregated: ${Object.keys(byWorker).length}
    - Current metric: ${AppState.currentMetricType}
    `);
    
    // Set primary process (process with most time spent)
    Object.values(byWorker).forEach(worker => {
        if (Object.keys(worker.processTimes).length > 0) {
            // Find process with maximum time
            const primaryProcess = Object.entries(worker.processTimes)
                .sort((a, b) => b[1] - a[1])[0][0];
            worker.foDesc3 = primaryProcess;
        }
    });
    
    // Calculate metrics for each worker
    const result = Object.values(byWorker).map(worker => {
        const shiftCount = worker.shifts.size;
        
        // Calculate Time Utilization Rate: total work time / (660 min * shift count) × 100
        const utilizationRate = shiftCount > 0 ? (worker.totalMinutes / (660 * shiftCount)) * 100 : 0;
        const utilizationBand = getUtilizationBand(utilizationRate);
        
        // Calculate Work Efficiency Rate: assigned standard time / actual time × 100
        const efficiencyRate = worker.totalMinutesOriginal > 0 
            ? (worker.assignedStandardTime / worker.totalMinutesOriginal) * 100 
            : 0;
        const efficiencyBand = getEfficiencyBand(efficiencyRate);
        
        return {
            ...worker,
            shiftCount: shiftCount,
            utilizationRate: utilizationRate,
            utilizationBand: utilizationBand,
            efficiencyRate: efficiencyRate,
            efficiencyBand: efficiencyBand,
            // Legacy fields (for backward compatibility)
            workRate: utilizationRate,
            performanceBand: utilizationBand.label
        };
    });
    
    // Sort by current metric type
    if (AppState.currentMetricType === 'efficiency') {
        result.sort((a, b) => b.efficiencyRate - a.efficiencyRate);
    } else {
        result.sort((a, b) => b.utilizationRate - a.utilizationRate);
    }
    
    // ℹ️ No filtering at Worker Total level (already filtered at W/O level in aggregateByWorker)
    // Logic: If all W/O records are ≤ threshold, then Worker Total (average) must also be ≤ threshold
    console.log(`ℹ️ Worker Total level: No additional filtering needed (already filtered at W/O level)`);
    
    console.log('📊 Worker Summary (Top 5):', result.slice(0, 5).map(w => ({
        name: w.workerName,
        totalMinutes: w.totalMinutes.toFixed(0),
        shifts: w.shiftCount,
        utilizationRate: w.utilizationRate.toFixed(1) + '%',
        efficiencyRate: w.efficiencyRate.toFixed(1) + '%',
        utilizationBand: w.utilizationBand.label,
        efficiencyBand: w.efficiencyBand.label,
        process: w.foDesc3
    })));
    
    return result;
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
    
    // Header with rowspan for Worker Name
    html += '<thead>';
    html += '<tr>';
    html += '<th rowspan="2" style="min-width: 200px; text-align: left; vertical-align: middle;">Worker Name</th>';
    allDates.forEach(date => {
        html += `<th colspan="3">${date}</th>`;
    });
    html += '</tr>';
    
    html += '<tr>';
    allDates.forEach(() => {
        const isEfficiency = AppState.currentMetricType === 'efficiency';
        html += '<th style="font-size: 0.7rem;">WO Count</th>';
        html += `<th style="font-size: 0.7rem;">${isEfficiency ? 'Assigned(m)' : 'Std Time(m)'}</th>`;
        html += `<th style="font-size: 0.7rem;">${isEfficiency ? 'Efficiency Rate' : 'Work Rate'}</th>`;
    });
    html += '</tr>';
    html += '</thead>';
    
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
    
    // Update pivot glossary based on metric type
    const pivotGlossary = document.getElementById('pivotGlossary');
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    
    if (isEfficiency) {
        pivotGlossary.innerHTML = `
            <strong class="text-purple-700">Work Efficiency Metric:</strong><br>
            • <strong>WO Count</strong>: Number of valid work orders completed<br>
            • <strong>Assigned(m)</strong>: Total assigned standard time (S/T × Rate ÷ 100)<br>
            • <strong>Efficiency</strong>: Performance ratio = Assigned ÷ Actual × 100%<br>
            <span class="text-xs italic">Note: Only records with S/T > 0 are included in Efficiency calculation</span>
        `;
    } else {
        pivotGlossary.innerHTML = `
            <strong class="text-blue-700">Time Utilization Metric:</strong><br>
            • <strong>WO Count</strong>: Number of valid work orders completed<br>
            • <strong>Std Time(m)</strong>: Total work time after removing overlapping intervals<br>
            • <strong>Work Rate</strong>: Utilization = Actual time ÷ Available shift time × 100%<br>
            <span class="text-xs italic">Note: Overlapping time periods are detected and excluded</span>
        `;
    }
}

// Aggregate data by worker
function aggregateByWorker(data) {
    const aggregated = {};
    
    let totalRecords = 0;
    let validRecords = 0;
    let invalidRecords = 0;
    let filteredOutliers = 0; // ✅ NEW: Track outliers
    
    data.forEach(record => {
        totalRecords++;
        
        // Debug: Check first record's foDesc2
        if (totalRecords === 1) {
            console.log('🔍 First record in aggregateByWorker:', {
                workerName: record.workerName,
                foDesc3: record.foDesc3,
                foDesc2: record.foDesc2,
                seq: record.seq
            });
        }
        
        // ℹ️ Individual record outlier filtering removed - now done at aggregation level
        
        // Group by: worker + day + shift + actualShift + process for display purposes
        const key = `${record.workerName}|${record.workingDay}|${record.workingShift}|${record.actualShift}|${record.foDesc3}`;
        
        if (!aggregated[key]) {
            aggregated[key] = {
                workerName: record.workerName,
                foDesc3: record.foDesc3,
                foDesc2: record.foDesc2,  // Add foDesc2 for category ordering
                workingDay: record.workingDay,
                workingShift: record.workingShift,
                actualShift: record.actualShift,
                totalMinutes: 0,
                validCount: 0,
                seq: record.seq,
                // ✅ FIX: Preserve original fields for Efficiency mode
                'Worker S/T': record['Worker S/T'] || 0,
                'Worker Rate(%)': record['Worker Rate(%)'] || 0,
                assignedStandardTime: 0,
                totalMinutesOriginal: 0
            };
        }
        
        // Accumulate VALID work time only (validFlag === 1)
        if (record.validFlag === 1) {
            aggregated[key].totalMinutes += record.workerActMins || 0;
            aggregated[key].validCount += 1;
            validRecords++;
            
            // ✅ FIX: Accumulate efficiency fields
            const st = record['Worker S/T'] || 0;
            const rate = record['Worker Rate(%)'] || 0;
            aggregated[key].assignedStandardTime += (st * rate / 100);
            aggregated[key].totalMinutesOriginal += record['Worker Act'] || 0;
        } else {
            invalidRecords++;
        }
    });
    
    console.log(`📊 Aggregation summary: ${totalRecords} total, ${validRecords} valid, ${invalidRecords} invalid (outlier marking will be applied next)`);
    
    // Convert to array and calculate rates
    const result = Object.values(aggregated).map(item => {
        // Calculate Utilization Rate
        const utilizationRate = (item.totalMinutes / 660) * 100;
        
        // Calculate Efficiency Rate
        const efficiencyRate = item.totalMinutesOriginal > 0 
            ? (item.assignedStandardTime / item.totalMinutesOriginal) * 100 
            : 0;
        
        // ✅ Mark outliers for visual display (but don't filter them out)
        const outlierThreshold = AppState.outlierThreshold || 1000;
        const isOutlier = (AppState.currentMetricType === 'efficiency' && efficiencyRate > outlierThreshold);
        
        if (isOutlier) {
            console.warn(`🚫 Outlier marked (>${outlierThreshold}%): ${item.workerName}, ${item.workingDay}, ${item.foDesc3}, Efficiency: ${efficiencyRate.toFixed(1)}%`);
        }
        
        return {
            ...item,
            utilizationRate: utilizationRate,
            utilizationBand: getUtilizationBand(utilizationRate),
            efficiencyRate: efficiencyRate,
            efficiencyBand: getEfficiencyBand(efficiencyRate),
            isOutlier: isOutlier, // ✅ Flag for visual styling in table
            // Legacy fields
            workRate: utilizationRate,
            performanceBand: getPerformanceBand(utilizationRate)
        };
    });
    
    // Count outliers for logging
    const outlierCount = result.filter(r => r.isOutlier).length;
    if (outlierCount > 0) {
        console.log(`📊 Outlier marking complete: ${outlierCount} records marked (will be shown in gray with 🚫 icon)`);
    }
    
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
// Get Performance Band for Time Utilization Rate
function getUtilizationBand(rate) {
    if (rate >= 80) return { label: 'Excellent', color: 'green', bgColor: '#dcfce7', textColor: '#166534' };
    if (rate >= 50) return { label: 'Normal', color: 'gray', bgColor: '#f3f4f6', textColor: '#374151' };
    if (rate >= 30) return { label: 'Poor', color: 'orange', bgColor: '#fed7aa', textColor: '#c2410c' };
    return { label: 'Critical', color: 'red', bgColor: '#fecaca', textColor: '#991b1b' };
}

// Get Performance Band for Work Efficiency Rate
function getEfficiencyBand(rate) {
    if (rate >= 120) return { label: 'Excellent', color: 'green', bgColor: '#dcfce7', textColor: '#166534' };
    if (rate >= 100) return { label: 'Normal', color: 'gray', bgColor: '#f3f4f6', textColor: '#374151' };
    if (rate >= 80) return { label: 'Poor', color: 'orange', bgColor: '#fed7aa', textColor: '#c2410c' };
    return { label: 'Critical', color: 'red', bgColor: '#fecaca', textColor: '#991b1b' };
}

// Legacy function (kept for backward compatibility)
function getPerformanceBand(workRate) {
    if (workRate >= 80) return 'Excellent';
    if (workRate >= 50) return 'Normal';
    if (workRate >= 30) return 'Poor';
    return 'Critical';
}

// Update KPIs
function updateKPIs(workerAgg) {
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    
    // Update KPI label based on metric type
    const kpiLabel = document.getElementById('kpiAvgRateLabel');
    if (kpiLabel) {
        kpiLabel.textContent = isEfficiency ? 'Average Efficiency Rate' : 'Average Utilization Rate';
    }
    
    const kpiTotalTimeLabel = document.getElementById('kpiTotalTimeLabel');
    if (kpiTotalTimeLabel) {
        kpiTotalTimeLabel.textContent = isEfficiency ? 'Total Assigned Time (min)' : 'Total Work Time (min)';
    }
    
    const totalWorkers = new Set(workerAgg.map(w => w.workerName)).size;
    const totalValidWO = workerAgg.reduce((sum, w) => sum + w.validCount, 0);
    
    // Calculate average rate based on current metric type
    const avgRate = workerAgg.length > 0 
        ? (isEfficiency 
            ? workerAgg.reduce((sum, w) => sum + (w.efficiencyRate || 0), 0) / workerAgg.length
            : workerAgg.reduce((sum, w) => sum + (w.utilizationRate || 0), 0) / workerAgg.length)
        : 0;
    
    console.log(`📊 KPI Calculation:
    - Metric: ${isEfficiency ? 'Efficiency' : 'Utilization'}
    - Workers: ${workerAgg.length}
    - Total Rate: ${isEfficiency ? workerAgg.reduce((sum, w) => sum + (w.efficiencyRate || 0), 0).toFixed(2) : workerAgg.reduce((sum, w) => sum + (w.utilizationRate || 0), 0).toFixed(2)}
    - Average Rate: ${avgRate.toFixed(2)}%
    `);
    
    // For Time Utilization: show total actual minutes worked (after deduplication)
    // For Work Efficiency: show total assigned standard minutes
    const totalValue = isEfficiency
        ? workerAgg.reduce((sum, w) => sum + (w.assignedStandardTime || 0), 0)
        : workerAgg.reduce((sum, w) => sum + (w.totalMinutes || 0), 0);
    
    // Format numbers with thousand separators
    document.getElementById('kpiWorkers').textContent = totalWorkers.toLocaleString();
    document.getElementById('kpiValidWO').textContent = totalValidWO.toLocaleString();
    document.getElementById('kpiTotalMinutes').textContent = Math.round(totalValue).toLocaleString();
    document.getElementById('kpiAvgWorkRate').textContent = avgRate.toFixed(1) + '%';
    
    // ✅ Show/hide Outlier Threshold control based on metric type
    const outlierControl = document.getElementById('outlierThresholdControl');
    if (outlierControl) {
        outlierControl.style.display = isEfficiency ? 'block' : 'none';
    }
}

// Update performance bands
function updatePerformanceBands(workerAgg) {
    // Determine which metric to use
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    
    console.log(`📊 updatePerformanceBands - Mode: ${isEfficiency ? 'Efficiency' : 'Utilization'}, Workers: ${workerAgg.length}`);
    
    // Debug: Show first 3 workers with their bands
    if (workerAgg.length > 0) {
        const samples = workerAgg.slice(0, 3).map(w => ({
            name: w.workerName,
            utilizationRate: w.utilizationRate?.toFixed(1),
            utilizationBand: w.utilizationBand?.label,
            efficiencyRate: w.efficiencyRate?.toFixed(1),
            efficiencyBand: w.efficiencyBand?.label,
            assignedST: w.assignedStandardTime?.toFixed(1),
            actualTime: w.totalMinutesOriginal?.toFixed(1)
        }));
        console.log('🔍 Sample workers:', samples);
        console.table(samples);
    }
    
    // Update band titles based on current metric
    const excellentTitle = document.getElementById('excellentTitle');
    const normalTitle = document.getElementById('normalTitle');
    const poorTitle = document.getElementById('poorTitle');
    const criticalTitle = document.getElementById('criticalTitle');
    
    if (isEfficiency) {
        // Work Efficiency bands
        excellentTitle.innerHTML = '<i class="fas fa-trophy mr-2"></i>Excellent Workers (≥120%)';
        normalTitle.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Normal Workers (100-<120%)';
        poorTitle.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Poor Workers (80-<100%)';
        criticalTitle.innerHTML = '<i class="fas fa-times-circle mr-2"></i>At-Risk Workers (<80%)';
    } else {
        // Time Utilization bands
        excellentTitle.innerHTML = '<i class="fas fa-trophy mr-2"></i>Excellent Workers (≥80%)';
        normalTitle.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Normal Workers (50-<80%)';
        poorTitle.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Poor Workers (30-<50%)';
        criticalTitle.innerHTML = '<i class="fas fa-times-circle mr-2"></i>At-Risk Workers (<30%)';
    }
    
    // Filter workers by performance band based on current metric
    const excellent = workerAgg.filter(w => {
        const band = isEfficiency ? w.efficiencyBand : w.utilizationBand;
        return band && band.label === 'Excellent';
    });
    const normal = workerAgg.filter(w => {
        const band = isEfficiency ? w.efficiencyBand : w.utilizationBand;
        return band && band.label === 'Normal';
    });
    const poor = workerAgg.filter(w => {
        const band = isEfficiency ? w.efficiencyBand : w.utilizationBand;
        return band && band.label === 'Poor';
    });
    const critical = workerAgg.filter(w => {
        const band = isEfficiency ? w.efficiencyBand : w.utilizationBand;
        return band && band.label === 'Critical';
    });
    
    console.log(`📊 Band distribution: Excellent=${excellent.length}, Normal=${normal.length}, Poor=${poor.length}, Critical=${critical.length}`);
    
    // Get rate value based on current metric
    const getRate = (w) => isEfficiency ? w.efficiencyRate : w.utilizationRate;
    
    // Excellent workers
    const excellentDiv = document.getElementById('excellentWorkers');
    if (excellent.length > 0) {
        excellentDiv.innerHTML = '<div class="space-y-2">' + excellent.map(w => 
            `<div class="flex flex-col p-4 bg-white border-l-4 border-green-500 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-800">${w.workerName}</span>
                    <span class="text-green-600 font-bold text-lg">${getRate(w).toFixed(1)}%</span>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs">
                    <span class="text-gray-600"><i class="fas fa-cog mr-1"></i>${w.foDesc3 || 'N/A'}</span>
                    <span class="text-gray-500">${w.workingDay || ''}</span>
                </div>
            </div>`
        ).join('') + '</div>';
    } else {
        excellentDiv.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No data available</p>';
    }
    
    // Normal workers - ✅ FIX: Use blue color consistently
    const normalDiv = document.getElementById('normalWorkers');
    if (normal.length > 0) {
        normalDiv.innerHTML = '<div class="space-y-2">' + normal.map(w => 
            `<div class="flex flex-col p-4 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-800">${w.workerName}</span>
                    <span class="text-blue-600 font-bold text-lg">${getRate(w).toFixed(1)}%</span>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs">
                    <span class="text-gray-600"><i class="fas fa-cog mr-1"></i>${w.foDesc3 || 'N/A'}</span>
                    <span class="text-gray-500">${w.workingDay || ''}</span>
                </div>
            </div>`
        ).join('') + '</div>';
    } else {
        normalDiv.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No data available</p>';
    }
    
    // Poor workers
    const poorDiv = document.getElementById('poorWorkers');
    if (poor.length > 0) {
        poorDiv.innerHTML = '<div class="space-y-2">' + poor.map(w => 
            `<div class="flex flex-col p-4 bg-white border-l-4 border-orange-500 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-800">${w.workerName}</span>
                    <span class="text-orange-600 font-bold text-lg">${getRate(w).toFixed(1)}%</span>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs">
                    <span class="text-gray-600"><i class="fas fa-cog mr-1"></i>${w.foDesc3 || 'N/A'}</span>
                    <span class="text-gray-500">${w.workingDay || ''}</span>
                </div>
            </div>`
        ).join('') + '</div>';
    } else {
        poorDiv.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No data available</p>';
    }
    
    // Critical workers
    const criticalDiv = document.getElementById('criticalWorkers');
    if (critical.length > 0) {
        criticalDiv.innerHTML = '<div class="space-y-2">' + critical.map(w => 
            `<div class="flex flex-col p-4 bg-white border-l-4 border-red-500 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-800">${w.workerName}</span>
                    <span class="text-red-600 font-bold text-lg">${getRate(w).toFixed(1)}%</span>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs">
                    <span class="text-gray-600"><i class="fas fa-cog mr-1"></i>${w.foDesc3 || 'N/A'}</span>
                    <span class="text-gray-500">${w.workingDay || ''}</span>
                </div>
            </div>`
        ).join('') + '</div>';
    } else {
        criticalDiv.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No data available</p>';
    }
}

// Update charts
function updateCharts(workerSummary, filteredData) {
    updateProcessChart(filteredData); // Use filteredData instead of workerSummary
    updatePerformanceChart(workerSummary);
}

// Update process chart
function updateProcessChart(filteredData) {
    const processData = {};
    
    // Create a map of process -> seq from processMapping
    const processSeqMap = {};
    AppState.processMapping.forEach(mapping => {
        const processName = mapping.foDesc3 || mapping.foDesc2;
        if (processName && !processSeqMap[processName]) {
            processSeqMap[processName] = mapping.seq;
        }
    });
    
    // Aggregate by process (foDesc3) from filteredData
    filteredData.forEach(record => {
        if (!processData[record.foDesc3]) {
            // Get seq from mapping
            const seq = processSeqMap[record.foDesc3];
            // Get category order (foDesc2)
            const categorySeq = CATEGORY_ORDER[record.foDesc2] || 999;
            
            processData[record.foDesc3] = {
                totalMinutes: 0,
                count: 0,
                workers: new Set(), // Track unique workers
                workerShifts: {}, // Track shifts per worker
                seq: seq !== null && seq !== undefined ? seq : 999,
                categorySeq: categorySeq,
                foDesc2: record.foDesc2
            };
        }
        processData[record.foDesc3].totalMinutes += record.workerActMins || 0;
        processData[record.foDesc3].count += 1;
        processData[record.foDesc3].workers.add(record.workerName);
        
        // Track unique shifts per worker
        if (!processData[record.foDesc3].workerShifts[record.workerName]) {
            processData[record.foDesc3].workerShifts[record.workerName] = new Set();
        }
        const shiftKey = `${record.workingDay}_${record.workingShift}`;
        processData[record.foDesc3].workerShifts[record.workerName].add(shiftKey);
    });
    
    // Debug: Show sample process data before calculation
    const sampleProcesses = Object.entries(processData).slice(0, 3);
    console.log('🔍 Sample process data:');
    sampleProcesses.forEach(([name, data]) => {
        const workerCount = data.workers.size;
        const totalShifts = Object.values(data.workerShifts).reduce((sum, shifts) => sum + shifts.size, 0);
        console.log(`  ${name}: totalMinutes=${data.totalMinutes.toFixed(1)}, records=${data.count}, workers=${workerCount}, totalShifts=${totalShifts}, avgPerWorker=${(data.totalMinutes/workerCount).toFixed(1)}min`);
    });
    
    // Sort processes by category first, then by seq within category
    const sortedProcesses = Object.entries(processData)
        .map(([name, data]) => {
            const workerCount = data.workers.size;
            // Calculate total shifts across all workers
            const totalShifts = Object.values(data.workerShifts).reduce((sum, shifts) => sum + shifts.size, 0);
            
            // Correct formula: (total minutes / total shifts / 660) * 100
            const avgWorkRate = totalShifts > 0 
                ? ((data.totalMinutes / totalShifts / 660) * 100).toFixed(1)
                : '0.0';
            
            return {
                name,
                avgWorkRate: avgWorkRate,
                totalMinutes: data.totalMinutes,
                count: data.count,
                workerCount: workerCount,
                totalShifts: totalShifts,
                avgMinutesPerWorker: workerCount > 0 ? (data.totalMinutes / workerCount).toFixed(1) : '0',
                seq: data.seq,
                categorySeq: data.categorySeq,
                foDesc2: data.foDesc2
            };
        })
        .sort((a, b) => {
            // Primary sort: by category
            if (a.categorySeq !== b.categorySeq) {
                return a.categorySeq - b.categorySeq;
            }
            // Secondary sort: by process seq within category
            return a.seq - b.seq;
        });
    
    console.log('📊 Process chart order:', sortedProcesses.map(p => `${p.name} [${p.foDesc2}] (Cat: ${p.categorySeq}, Seq: ${p.seq}, WorkRate: ${p.avgWorkRate}%)`).join(', '));
    console.log('📊 Top 3 processes:', sortedProcesses.slice(0, 3).map(p => ({
        name: p.name,
        totalMinutes: p.totalMinutes.toFixed(1),
        records: p.count,
        workers: p.workerCount,
        avgMinutesPerWorker: p.avgMinutesPerWorker,
        workRate: p.avgWorkRate + '%'
    })));
    
    const processes = sortedProcesses.map(p => p.name);
    const avgWorkRates = sortedProcesses.map(p => p.avgWorkRate);
    
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
    const thead = document.querySelector('#dataTable thead tr');
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    
    // ✅ FIX: Update entire table header with sortable columns
    if (isEfficiency) {
        thead.innerHTML = `
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('workerName')">
                Worker <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th>Process (FO Desc 3)</th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('workingDay')">
                Work Date <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th>Shift</th>
            <th>Day/Night</th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('st')">
                S/T (min) <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th>Rate (%)</th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('assigned')">
                Assigned (min) <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('actual')">
                Actual (min) <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('efficiencyRate')">
                Efficiency Rate <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th>Performance Grade</th>
        `;
    } else {
        thead.innerHTML = `
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('workerName')">
                Worker <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th>Process (FO Desc 3)</th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('workingDay')">
                Work Date <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th>Shift</th>
            <th>Day/Night</th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('totalMinutes')">
                Work Time (min) <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th>Work Count</th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('utilizationRate')">
                Utilization Rate <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th>Performance Grade</th>
        `;
    }
    
    if (workerAgg.length === 0) {
        const colSpan = isEfficiency ? 11 : 9;
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center text-gray-500">No data matches the filter criteria</td></tr>`;
        return;
    }
    
    tbody.innerHTML = workerAgg.map(item => {
        const band = isEfficiency ? item.efficiencyBand : item.utilizationBand;
        const rate = isEfficiency ? item.efficiencyRate : item.utilizationRate;
        
        const bandClass = {
            'Excellent': 'badge-excellent',
            'Normal': 'badge-normal',
            'Poor': 'badge-poor',
            'Critical': 'badge-critical'
        }[band?.label || 'Critical'];
        
        const bandText = {
            'Excellent': 'Excellent',
            'Normal': 'Normal',
            'Poor': 'Poor',
            'Critical': 'At-Risk'
        }[band?.label || 'Critical'];
        
        const shiftText = item.workingShift === 'Day' ? 'Day' : 'Night';
        const actualShiftText = item.actualShift || '-';
        
        // ✅ Visual styling for outliers
        const outlierThreshold = AppState.outlierThreshold || 1000;
        const isOutlier = item.isOutlier || false;
        const cellStyle = isOutlier ? 'style="background-color: #fee2e2 !important; opacity: 0.6 !important;"' : '';
        const outlierIcon = isOutlier ? `<i class="fas fa-ban text-red-500 mr-1" title="Filtered out: Efficiency ${rate?.toFixed(1)}% (>${outlierThreshold}%)"></i>` : '';
        
        if (isEfficiency) {
            // Efficiency mode: show S/T, Rate, Assigned, Actual, Efficiency Rate
            const st = item['Worker S/T'] || 0;
            const workerRate = item['Worker Rate(%)'] || 0;
            const assigned = item.assignedStandardTime || 0;
            const actual = item.totalMinutesOriginal || 0;
            
            return `
                <tr>
                    <td ${cellStyle}>${outlierIcon}${item.workerName}</td>
                    <td ${cellStyle}>${item.foDesc3}</td>
                    <td ${cellStyle}>${item.workingDay}</td>
                    <td ${cellStyle}><strong>${actualShiftText}</strong></td>
                    <td ${cellStyle}>${shiftText}</td>
                    <td ${cellStyle}>${st.toFixed(1)}</td>
                    <td ${cellStyle}>${workerRate.toFixed(0)}</td>
                    <td ${cellStyle}>${assigned.toFixed(0)}</td>
                    <td ${cellStyle}>${actual.toFixed(0)}</td>
                    <td ${cellStyle}><strong>${rate?.toFixed(1) || '0.0'}%</strong></td>
                    <td ${cellStyle}><span class="worker-badge ${bandClass}">${bandText}</span></td>
                </tr>
            `;
        } else {
            // Utilization mode: show Work Time, Work Count, Utilization Rate
            return `
                <tr>
                    <td ${cellStyle}>${outlierIcon}${item.workerName}</td>
                    <td ${cellStyle}>${item.foDesc3}</td>
                    <td ${cellStyle}>${item.workingDay}</td>
                    <td ${cellStyle}><strong>${actualShiftText}</strong></td>
                    <td ${cellStyle}>${shiftText}</td>
                    <td ${cellStyle}>${Math.round(item.totalMinutes)}</td>
                    <td ${cellStyle}>${item.validCount}</td>
                    <td ${cellStyle}><strong>${rate?.toFixed(1) || '0.0'}%</strong></td>
                    <td ${cellStyle}><span class="worker-badge ${bandClass}">${bandText}</span></td>
                </tr>
            `;
        }
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
        { fdDesc: 'Mechanical', foDesc2: 'IM', foDesc3: 'Mechanical', seq: 5 },
        
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

// Database button handlers
function initDatabaseButtons() {
    // Load last upload button
    document.getElementById('loadLastUploadBtn')?.addEventListener('click', loadLastUpload);
    
    // Save to database button
    document.getElementById('saveToDatabaseBtn')?.addEventListener('click', () => {
        saveToDatabase();
    });
    
    // Refresh uploads list button
    document.getElementById('refreshUploadsBtn')?.addEventListener('click', () => {
        loadUploadsList();
    });
    
    // Load uploads list on page load
    loadUploadsList();
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
async function saveToDatabase() {
    const saveBtn = document.getElementById('saveToDatabaseBtn');
    const saveStatus = document.getElementById('saveStatus');
    
    if (!AppState.processedData || AppState.processedData.length === 0) {
        alert('No data to save. Please upload an Excel file first.');
        return;
    }
    
    try {
        // Disable button and show loading
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
        saveStatus.classList.add('hidden');
        
        console.log('💾 Saving data to database...');
        console.log('📊 Data to save:', {
            filename: AppState.currentFileName,
            fileSize: AppState.currentFileSize,
            processedDataCount: AppState.processedData.length,
            processMappingCount: AppState.processMapping.length,
            shiftCalendarCount: AppState.shiftCalendar.length
        });
        
        const payload = {
            filename: AppState.currentFileName || 'Unknown',
            fileSize: AppState.currentFileSize || 0,
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
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Data saved successfully!', result);
            console.log(`📊 Upload ID: ${result.uploadId}`);
            console.log(`📈 Stats:`, result.stats);
            
            // Show success status
            saveStatus.classList.remove('hidden');
            saveBtn.innerHTML = '<i class="fas fa-check mr-2"></i>Saved';
            saveBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
            saveBtn.classList.add('bg-green-600');
            
            // Refresh uploads list
            loadUploadsList();
            
            setTimeout(() => {
                saveBtn.disabled = false;
                saveBtn.innerHTML = '<i class="fas fa-database mr-2"></i>Save to Database';
                saveBtn.classList.remove('bg-green-600');
                saveBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
            }, 3000);
        } else {
            throw new Error(result.error || 'Save failed');
        }
    } catch (error) {
        console.error('❌ Failed to save to database:', error);
        alert('Failed to save to database:\n' + error.message);
        
        // Reset button
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-database mr-2"></i>Save to Database';
    }
}

// Load uploads list
async function loadUploadsList() {
    const uploadsListDiv = document.getElementById('uploadsList');
    
    try {
        // Show loading
        uploadsListDiv.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-spinner fa-spin text-4xl mb-2"></i>
                <p>Loading uploads...</p>
            </div>
        `;
        
        const response = await fetch('/api/uploads');
        if (!response.ok) {
            throw new Error(`Failed to fetch uploads: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !result.uploads || result.uploads.length === 0) {
            uploadsListDiv.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-inbox text-4xl mb-2"></i>
                    <p>No saved uploads yet. Upload a file to get started.</p>
                </div>
            `;
            return;
        }
        
        // Display uploads as cards
        uploadsListDiv.innerHTML = result.uploads.map(upload => {
            const date = new Date(upload.upload_date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50 transition">
                    <div class="flex justify-between items-start">
                        <div class="flex-1 cursor-pointer" onclick="loadUploadById(${upload.id})">
                            <div class="flex items-center mb-2">
                                <i class="fas fa-file-excel text-green-600 mr-2"></i>
                                <h3 class="font-semibold text-gray-800">${upload.filename}</h3>
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                <div><i class="fas fa-calendar mr-1"></i> ${date}</div>
                                <div><i class="fas fa-database mr-1"></i> ${(upload.file_size / 1024).toFixed(0)} KB</div>
                                <div><i class="fas fa-list mr-1"></i> ${upload.total_records.toLocaleString()} records</div>
                                <div><i class="fas fa-users mr-1"></i> ${upload.unique_workers} workers</div>
                            </div>
                            ${upload.date_range_start ? `
                                <div class="text-xs text-gray-500 mt-2">
                                    <i class="fas fa-clock mr-1"></i> ${upload.date_range_start} ~ ${upload.date_range_end || 'N/A'}
                                </div>
                            ` : ''}
                        </div>
                        <div class="flex flex-col gap-2 ml-4">
                            <button onclick="loadUploadById(${upload.id})" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition">
                                <i class="fas fa-download mr-1"></i> Load
                            </button>
                            <button onclick="deleteUpload(${upload.id}, event)" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition">
                                <i class="fas fa-trash mr-1"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log(`✅ Loaded ${result.uploads.length} uploads`);
        
    } catch (error) {
        console.error('❌ Failed to load uploads list:', error);
        uploadsListDiv.innerHTML = `
            <div class="text-center text-red-500 py-8">
                <i class="fas fa-exclamation-triangle text-4xl mb-2"></i>
                <p>Failed to load uploads</p>
                <p class="text-sm">${error.message}</p>
            </div>
        `;
    }
}

// Delete upload by ID
async function deleteUpload(uploadId, event) {
    // Prevent card click event
    if (event) {
        event.stopPropagation();
    }
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete this upload?\n\nThis will permanently delete:\n- Upload record\n- ${AppState.processedData?.length || 'All'} raw data records\n- Process mappings\n- Shift calendar data\n\nThis action cannot be undone.`)) {
        return;
    }
    
    try {
        console.log(`🗑️  Deleting upload #${uploadId}...`);
        
        const response = await fetch(`/api/uploads/${uploadId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log(`✅ Upload #${uploadId} deleted successfully`);
            
            // Refresh uploads list
            loadUploadsList();
            
            // Show success message
            alert(`Upload deleted successfully!\n\n${result.message}`);
        } else {
            throw new Error(result.error || 'Delete failed');
        }
    } catch (error) {
        console.error(`❌ Failed to delete upload #${uploadId}:`, error);
        alert('Failed to delete upload:\n' + error.message);
    }
}

// Load specific upload by ID
async function loadUploadById(uploadId) {
    try {
        console.log(`📥 Loading upload #${uploadId}...`);
        showUploadStatus(true);
        updateProgress(20);
        
        // Fetch full data for this upload
        const dataResponse = await fetch(`/api/uploads/${uploadId}`);
        if (!dataResponse.ok) {
            throw new Error(`Failed to fetch upload data: ${dataResponse.status}`);
        }
        
        updateProgress(60);
        const dataResult = await dataResponse.json();
        
        if (!dataResult.success) {
            throw new Error('Failed to load upload data');
        }
        
        updateProgress(80);
        
        // Restore data to AppState - convert DB format to app format
        AppState.rawData = (dataResult.rawData || []).map(d => ({
            workerName: d.worker_name,
            foDesc: d.fo_desc,
            fdDesc: d.fd_desc,
            startDatetime: d.start_datetime,
            endDatetime: d.end_datetime,
            workerAct: d.worker_act,
            workerActMins: d.worker_act,  // Add this field for consistency
            resultCnt: d.result_cnt,
            workingDay: d.working_day,
            workingShift: d.working_shift,
            actualShift: d.actual_shift,
            workRate: d.work_rate
        }));
        
        AppState.processMapping = (dataResult.processMapping || []).map(m => ({
            fdDesc: m.fd_desc,
            foDesc2: m.fo_desc_2,
            foDesc3: m.fo_desc_3,
            seq: m.seq
        }));
        
        // Merge with default mappings to fill in missing seq values
        loadDefaultProcessMapping();
        const defaultMappings = AppState.processMapping;
        AppState.processMapping = (dataResult.processMapping || []).map(m => {
            const dbMapping = {
                fdDesc: m.fd_desc,
                foDesc2: m.fo_desc_2,
                foDesc3: m.fo_desc_3,
                seq: m.seq
            };
            // If seq is null/undefined, try to find it from default mappings
            if (dbMapping.seq === null || dbMapping.seq === undefined) {
                const defaultMatch = defaultMappings.find(dm => 
                    dm.foDesc3 === dbMapping.foDesc3 && dm.foDesc2 === dbMapping.foDesc2
                );
                if (defaultMatch) {
                    dbMapping.seq = defaultMatch.seq;
                }
            }
            return dbMapping;
        });
        
        AppState.shiftCalendar = (dataResult.shiftCalendar || []).map(s => ({
            date: s.date,
            dayShift: s.day_shift,
            nightShift: s.night_shift
        }));
        
        // Convert datetime strings back to Date objects for rawData
        AppState.rawData = AppState.rawData.map(d => ({
            ...d,
            startDatetime: d.startDatetime ? new Date(d.startDatetime) : null,
            endDatetime: d.endDatetime ? new Date(d.endDatetime) : null
        }));
        
        // Re-process the data with current mappings
        console.log('🔄 Re-processing data with mappings...');
        AppState.processedData = processData(AppState.rawData);
        
        updateProgress(100);
        
        // Update UI
        updateMappingTable();
        showUploadResult(AppState.processedData);
        updateReport();
        
        // Switch to Report tab
        switchTab('report');
        
        console.log('✅ Data loaded successfully!');
        console.log(`📊 Loaded ${AppState.processedData.length} records from upload #${uploadId}`);
        console.log(`📅 Upload: ${dataResult.upload.filename}`);
        
        setTimeout(() => {
            showUploadStatus(false);
        }, 500);
        
    } catch (error) {
        console.error('❌ Failed to load upload:', error);
        alert('Failed to load upload:\n' + error.message);
        showUploadStatus(false);
    }
}

// Load last upload from database
async function loadLastUpload() {
    try {
        console.log('📥 Loading last upload from database...');
        showUploadStatus(true);
        updateProgress(20);
        
        // Get list of uploads
        const listResponse = await fetch('/api/uploads');
        if (!listResponse.ok) {
            throw new Error(`Failed to fetch uploads: ${listResponse.status}`);
        }
        
        updateProgress(40);
        const listResult = await listResponse.json();
        
        if (!listResult.success || !listResult.uploads || listResult.uploads.length === 0) {
            alert('No uploads found in database.');
            showUploadStatus(false);
            return;
        }
        
        // Get the most recent upload
        const lastUpload = listResult.uploads[0];
        console.log('📄 Last upload:', lastUpload);
        
        updateProgress(60);
        
        // Fetch full data for this upload
        const dataResponse = await fetch(`/api/uploads/${lastUpload.id}`);
        if (!dataResponse.ok) {
            throw new Error(`Failed to fetch upload data: ${dataResponse.status}`);
        }
        
        updateProgress(80);
        const dataResult = await dataResponse.json();
        
        if (!dataResult.success) {
            throw new Error('Failed to load upload data');
        }
        
        // Restore data to AppState - convert DB format to app format
        AppState.rawData = (dataResult.rawData || []).map(d => ({
            workerName: d.worker_name,
            foDesc: d.fo_desc,
            fdDesc: d.fd_desc,
            startDatetime: d.start_datetime,
            endDatetime: d.end_datetime,
            workerAct: d.worker_act,
            workerActMins: d.worker_act,  // Add this field for consistency
            resultCnt: d.result_cnt,
            workingDay: d.working_day,
            workingShift: d.working_shift,
            actualShift: d.actual_shift,
            workRate: d.work_rate
        }));
        
        AppState.processMapping = (dataResult.processMapping || []).map(m => ({
            fdDesc: m.fd_desc,
            foDesc2: m.fo_desc_2,
            foDesc3: m.fo_desc_3,
            seq: m.seq
        }));
        
        // Merge with default mappings to fill in missing seq values
        loadDefaultProcessMapping();
        const defaultMappings = AppState.processMapping;
        AppState.processMapping = (dataResult.processMapping || []).map(m => {
            const dbMapping = {
                fdDesc: m.fd_desc,
                foDesc2: m.fo_desc_2,
                foDesc3: m.fo_desc_3,
                seq: m.seq
            };
            // If seq is null/undefined, try to find it from default mappings
            if (dbMapping.seq === null || dbMapping.seq === undefined) {
                const defaultMatch = defaultMappings.find(dm => 
                    dm.foDesc3 === dbMapping.foDesc3 && dm.foDesc2 === dbMapping.foDesc2
                );
                if (defaultMatch) {
                    dbMapping.seq = defaultMatch.seq;
                }
            }
            return dbMapping;
        });
        
        AppState.shiftCalendar = (dataResult.shiftCalendar || []).map(s => ({
            date: s.date,
            dayShift: s.day_shift,
            nightShift: s.night_shift
        }));
        
        // Convert datetime strings back to Date objects for rawData
        AppState.rawData = AppState.rawData.map(d => ({
            ...d,
            startDatetime: d.startDatetime ? new Date(d.startDatetime) : null,
            endDatetime: d.endDatetime ? new Date(d.endDatetime) : null
        }));
        
        // Re-process the data with current mappings
        console.log('🔄 Re-processing data with mappings...');
        AppState.processedData = processData(AppState.rawData);
        
        updateProgress(100);
        
        // Update UI
        updateMappingTable();
        showUploadResult(AppState.processedData);
        updateReport();
        
        console.log('✅ Data loaded successfully!');
        console.log(`📊 Loaded ${AppState.processedData.length} records from upload #${lastUpload.id}`);
        console.log(`📅 Upload date: ${lastUpload.upload_date}`);
        console.log(`📁 Filename: ${lastUpload.filename}`);
        
        setTimeout(() => {
            showUploadStatus(false);
        }, 1000);
        
    } catch (error) {
        console.error('❌ Failed to load from database:', error);
        alert('Failed to load last upload:\n' + error.message);
        showUploadStatus(false);
    }
}

// Sort Performance Bands
function sortPerformanceBand(bandType, order) {
    // ✅ FIX: Use cached workerSummary instead of re-aggregating
    const aggregatedData = AppState.workerSummary || [];
    
    if (aggregatedData.length === 0) {
        console.warn('⚠️ No worker summary data available for sorting');
        return;
    }
    
    // Determine which metric to use for sorting
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    const sortKey = isEfficiency ? 'efficiencyRate' : 'utilizationRate';
    
    console.log(`🔄 Sorting ${bandType} band by ${sortKey} (${order})`);
    
    let workers;
    if (bandType === 'excellent') {
        workers = aggregatedData.filter(w => w.performanceBand === 'Excellent');
    } else if (bandType === 'normal') {
        workers = aggregatedData.filter(w => w.performanceBand === 'Normal');
    } else if (bandType === 'poor') {
        workers = aggregatedData.filter(w => w.performanceBand === 'Poor');
    } else if (bandType === 'critical') {
        workers = aggregatedData.filter(w => w.performanceBand === 'Critical');
    }
    
    // Sort by the current metric rate
    workers.sort((a, b) => {
        const rateA = a[sortKey] || 0;
        const rateB = b[sortKey] || 0;
        if (order === 'asc') {
            return rateA - rateB;
        } else {
            return rateB - rateA;
        }
    });
    
    // Render sorted workers
    const divId = bandType === 'excellent' ? 'excellentWorkers' : 
                  bandType === 'normal' ? 'normalWorkers' :
                  bandType === 'poor' ? 'poorWorkers' : 'criticalWorkers';
    const colorClass = bandType === 'excellent' ? 'green' :
                       bandType === 'normal' ? 'blue' :
                       bandType === 'poor' ? 'orange' : 'red';
    
    console.log(`✅ Rendering ${workers.length} workers for ${bandType} band`);
    
    const div = document.getElementById(divId);
    if (workers.length > 0) {
        div.innerHTML = '<div class="space-y-2">' + workers.map(w => {
            // ✅ FIX: Use the correct rate based on current metric type
            const displayRate = isEfficiency ? w.efficiencyRate : w.utilizationRate;
            return `<div class="flex flex-col p-4 bg-white border-l-4 border-${colorClass}-500 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-800">${w.workerName}</span>
                    <span class="text-${colorClass}-600 font-bold text-lg">${displayRate.toFixed(1)}%</span>
                </div>
                <div class="flex justify-between items-center mt-2 text-xs">
                    <span class="text-gray-600"><i class="fas fa-cog mr-1"></i>${w.foDesc3 || 'N/A'}</span>
                    <span class="text-gray-500">${w.workingDay || ''}</span>
                </div>
            </div>`;
        }).join('') + '</div>';
    } else {
        div.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No data available</p>';
    }
}

// Show Worker Detail Modal
let modalCharts = {
    daily: null,
    process: null
};

function showWorkerDetail(workerName) {
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    
    // Update table header based on metric type
    const tableHeader = document.getElementById('modalRecordsTableHeader');
    if (isEfficiency) {
        tableHeader.innerHTML = `
            <tr>
                <th class="text-left p-2 font-semibold text-gray-700">Date</th>
                <th class="text-left p-2 font-semibold text-gray-700">Shift</th>
                <th class="text-left p-2 font-semibold text-gray-700">Process</th>
                <th class="text-right p-2 font-semibold text-gray-700">S/T<br><span class="text-xs font-normal text-gray-500">(min)</span></th>
                <th class="text-right p-2 font-semibold text-gray-700">Rate<br><span class="text-xs font-normal text-gray-500">(%)</span></th>
                <th class="text-right p-2 font-semibold text-gray-700">Assigned<br><span class="text-xs font-normal text-gray-500">(min)</span></th>
                <th class="text-right p-2 font-semibold text-gray-700">Actual<br><span class="text-xs font-normal text-gray-500">(min)</span></th>
                <th class="text-right p-2 font-semibold text-gray-700">Efficiency<br><span class="text-xs font-normal text-gray-500">(%)</span></th>
            </tr>
        `;
    } else {
        tableHeader.innerHTML = `
            <tr>
                <th class="text-left p-2 font-semibold text-gray-700">Date</th>
                <th class="text-left p-2 font-semibold text-gray-700">Shift</th>
                <th class="text-left p-2 font-semibold text-gray-700">Start Time</th>
                <th class="text-left p-2 font-semibold text-gray-700">End Time</th>
                <th class="text-left p-2 font-semibold text-gray-700">Process</th>
                <th class="text-right p-2 font-semibold text-gray-700">Original<br><span class="text-xs font-normal text-gray-500">(min)</span></th>
                <th class="text-right p-2 font-semibold text-gray-700">Adjusted<br><span class="text-xs font-normal text-gray-500">(overlap removed)</span></th>
            </tr>
        `;
    }
    
    // Use filtered data if available, otherwise use all processed data
    const dataSource = AppState.filteredData || AppState.processedData;
    
    // Filter records: exclude Rework only (allow all records regardless of Worker S/T)
    const workerRecords = dataSource.filter(r => 
        r.workerName === workerName && 
        !r.rework
    );
    
    if (workerRecords.length === 0) {
        alert('No valid records found for this worker in the current filter');
        return;
    }
    
    // Count unique shifts
    const uniqueShifts = new Set();
    workerRecords.forEach(r => {
        const shiftKey = `${r.workingDay}_${r.workingShift}`;
        uniqueShifts.add(shiftKey);
    });
    const shiftCount = uniqueShifts.size;
    
    let currentRate, performanceBand, totalValue;
    
    if (isEfficiency) {
        // Work Efficiency Rate
        const assignedStandardTime = workerRecords.reduce((sum, r) => {
            const rate = r['Worker Rate(%)'] || 0;
            const st = r['Worker S/T'] || 0;
            return sum + (st * rate / 100);
        }, 0);
        const actualTime = workerRecords.reduce((sum, r) => sum + (r['Worker Act'] || 0), 0);
        
        currentRate = actualTime > 0 ? (assignedStandardTime / actualTime) * 100 : 0;
        performanceBand = getEfficiencyBand(currentRate);
        totalValue = assignedStandardTime;
        
        console.log(`📊 Worker Detail (Efficiency) for ${workerName}:`, {
            assignedStandardTime: assignedStandardTime.toFixed(1),
            actualTime: actualTime.toFixed(1),
            shiftCount,
            efficiencyRate: currentRate.toFixed(1) + '%',
            performanceBand: performanceBand.label,
            calculation: `${assignedStandardTime.toFixed(1)} / ${actualTime.toFixed(1)} * 100 = ${currentRate.toFixed(1)}%`
        });
    } else {
        // ✅ FIX: Use cached workerSummary data for consistency with main report
        const workerSummary = AppState.workerSummary || [];
        const cachedWorker = workerSummary.find(w => w.workerName === workerName);
        
        if (cachedWorker) {
            // Use pre-calculated values from workerSummary
            currentRate = cachedWorker.utilizationRate || 0;
            performanceBand = cachedWorker.utilizationBand || getUtilizationBand(currentRate);
            totalValue = cachedWorker.totalMinutes || 0;
            
            console.log(`📊 Worker Detail (Utilization) for ${workerName} [FROM CACHE]:`, {
                actualWorkTime: totalValue.toFixed(1),
                availableTime: shiftCount * 660,
                shiftCount,
                utilizationRate: currentRate.toFixed(1) + '%',
                performanceBand: performanceBand.label,
                calculation: `${totalValue.toFixed(1)} / ${shiftCount * 660} * 100 = ${currentRate.toFixed(1)}%`
            });
        } else {
            // Fallback: calculate if not in cache (shouldn't happen normally)
            console.warn(`⚠️ Worker ${workerName} not found in workerSummary, calculating manually`);
            const recordsToMerge = [...workerRecords];
            mergeOverlappingIntervals(recordsToMerge);
            
            const actualWorkTime = recordsToMerge.reduce((sum, r) => sum + (r.workerActMins || 0), 0);
            const availableTime = shiftCount * 660;
            
            currentRate = availableTime > 0 ? (actualWorkTime / availableTime) * 100 : 0;
            performanceBand = getUtilizationBand(currentRate);
            totalValue = actualWorkTime;
            
            console.log(`📊 Worker Detail (Utilization) for ${workerName} [MANUAL CALC]:`, {
                actualWorkTime: actualWorkTime.toFixed(1),
                availableTime,
                shiftCount,
                utilizationRate: currentRate.toFixed(1) + '%',
                performanceBand: performanceBand.label,
                calculation: `${actualWorkTime.toFixed(1)} / ${availableTime} * 100 = ${currentRate.toFixed(1)}%`
            });
        }
    }
    
    // Update modal header and summary
    document.getElementById('modalWorkerName').innerHTML = `<i class="fas fa-user-circle mr-2"></i>${workerName}`;
    document.getElementById('modalTotalMinutes').textContent = totalValue.toFixed(0) + (isEfficiency ? ' min (Assigned)' : ' min (Actual)');
    document.getElementById('modalWorkRate').textContent = currentRate.toFixed(1) + '%';
    document.getElementById('modalRecordCount').textContent = workerRecords.length;
    
    // ✅ FIX: Remove background color, only use text color
    const bandElement = document.getElementById('modalPerformanceBand');
    bandElement.textContent = performanceBand.label;
    bandElement.style.backgroundColor = 'transparent';
    bandElement.style.color = performanceBand.textColor;
    
    // Update glossary based on metric type
    const glossaryDiv = document.getElementById('modalGlossary');
    if (isEfficiency) {
        glossaryDiv.innerHTML = `
            <strong class="text-purple-700">Work Efficiency Glossary:</strong><br>
            • <strong>S/T</strong>: Standard Time - Expected time to complete a task<br>
            • <strong>Rate(%)</strong>: Worker's efficiency rating relative to standard<br>
            • <strong>Assigned(m)</strong>: Calculated time = S/T × Rate ÷ 100<br>
            • <strong>Actual(m)</strong>: Actual time spent on the task<br>
            • <strong>Efficiency(%)</strong>: Performance ratio = Assigned ÷ Actual × 100
        `;
    } else {
        glossaryDiv.innerHTML = `
            <strong class="text-blue-700">Time Utilization Glossary:</strong><br>
            • <strong>Original(m)</strong>: Time calculated from End - Start time<br>
            • <strong>Adjusted(m)</strong>: Original time after removing overlapping intervals<br>
            • <strong>Removed overlap</strong>: Duplicate time periods detected and excluded<br>
            • <strong>Utilization Rate</strong>: Adjusted time ÷ Available shift time × 100
        `;
    }
    
    // Render charts based on metric type
    if (isEfficiency) {
        renderEfficiencyCharts(workerRecords);
    } else {
        renderUtilizationCharts(workerRecords);
    }
    
    // Render records table based on metric type
    const tableBody = document.getElementById('modalRecordsTable');
    if (isEfficiency) {
        renderEfficiencyTable(workerRecords, tableBody);
    } else {
        renderUtilizationTable(workerRecords, tableBody);
    }
    
    // Show modal
    document.getElementById('workerDetailModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Render Time Utilization charts
function renderUtilizationCharts(workerRecords) {
    // Group by date for daily chart (show time in minutes)
    const dailyData = {};
    workerRecords.forEach(r => {
        const date = r.workingDay || 'Unknown';
        if (!dailyData[date]) {
            dailyData[date] = 0;
        }
        dailyData[date] += r.workerActMins || 0;
    });
    
    const dates = Object.keys(dailyData).sort();
    const dailyMinutes = dates.map(d => dailyData[d]);
    
    // Destroy existing daily chart
    if (modalCharts.daily) {
        modalCharts.daily.destroy();
    }
    
    // Create daily chart (Time in minutes, blue theme)
    const dailyCtx = document.getElementById('modalDailyChart');
    modalCharts.daily = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Work Time (min)',
                data: dailyMinutes,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(0)} minutes`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Minutes' }
                }
            }
        }
    });
    
    // Group by hour of day for hourly distribution (minutes, blue theme)
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
        hourlyData[i] = 0;
    }
    
    workerRecords.forEach(r => {
        if (r.startDatetime) {
            const date = new Date(r.startDatetime);
            const hour = date.getHours();
            hourlyData[hour] += r.workerActMins || 0;
        }
    });
    
    const hours = Object.keys(hourlyData).map(h => `${h.padStart(2, '0')}:00`);
    const hourlyMinutes = Object.values(hourlyData);
    
    // Destroy existing process chart
    if (modalCharts.process) {
        modalCharts.process.destroy();
    }
    
    // Create hourly distribution chart
    const processCtx = document.getElementById('modalProcessChart');
    modalCharts.process = new Chart(processCtx, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Work Time (min)',
                data: hourlyMinutes,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(0)} minutes`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 9 },
                        maxRotation: 90,
                        minRotation: 90
                    }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Minutes' },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

// Render Work Efficiency charts
function renderEfficiencyCharts(workerRecords) {
    // Group by date for daily chart (show efficiency rate %)
    const dailyData = {};
    workerRecords.forEach(r => {
        const date = r.workingDay || 'Unknown';
        if (!dailyData[date]) {
            dailyData[date] = { assigned: 0, actual: 0 };
        }
        const rate = r['Worker Rate(%)'] || 0;
        const st = r['Worker S/T'] || 0;
        dailyData[date].assigned += st * rate / 100;
        dailyData[date].actual += r['Worker Act'] || 0;
    });
    
    const dates = Object.keys(dailyData).sort();
    const dailyEfficiency = dates.map(d => {
        const data = dailyData[d];
        return data.actual > 0 ? (data.assigned / data.actual) * 100 : 0;
    });
    
    // Destroy existing daily chart
    if (modalCharts.daily) {
        modalCharts.daily.destroy();
    }
    
    // Create daily chart (Efficiency %, purple theme)
    const dailyCtx = document.getElementById('modalDailyChart');
    modalCharts.daily = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Work Efficiency (%)',
                data: dailyEfficiency,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(1)}%`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Efficiency (%)' }
                }
            }
        }
    });
    
    // Group by hour for hourly distribution (efficiency %, purple theme)
    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
        hourlyData[i] = { assigned: 0, actual: 0 };
    }
    
    workerRecords.forEach(r => {
        if (r.startDatetime) {
            const date = new Date(r.startDatetime);
            const hour = date.getHours();
            const rate = r['Worker Rate(%)'] || 0;
            const st = r['Worker S/T'] || 0;
            hourlyData[hour].assigned += st * rate / 100;
            hourlyData[hour].actual += r['Worker Act'] || 0;
        }
    });
    
    const hours = Object.keys(hourlyData).map(h => `${h.padStart(2, '0')}:00`);
    const hourlyEfficiency = Object.values(hourlyData).map(data => 
        data.actual > 0 ? (data.assigned / data.actual) * 100 : 0
    );
    
    // Destroy existing process chart
    if (modalCharts.process) {
        modalCharts.process.destroy();
    }
    
    // Create hourly distribution chart
    const processCtx = document.getElementById('modalProcessChart');
    modalCharts.process = new Chart(processCtx, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Work Efficiency (%)',
                data: hourlyEfficiency,
                backgroundColor: 'rgba(139, 92, 246, 0.6)',
                borderColor: '#8b5cf6',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(1)}%`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 9 },
                        maxRotation: 90,
                        minRotation: 90
                    }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Efficiency (%)' },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

// Render Time Utilization records table
function renderUtilizationTable(workerRecords, tableBody) {
    tableBody.innerHTML = workerRecords
        .sort((a, b) => new Date(b.startDatetime) - new Date(a.startDatetime))
        .map(r => {
            const formatTime = (datetime) => {
                if (!datetime) return '-';
                const date = new Date(datetime);
                return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
            };
            
            const calculateOriginalMinutes = (start, end) => {
                if (!start || !end) return 0;
                return Math.round((new Date(end) - new Date(start)) / 60000);
            };
            
            const originalMinutes = calculateOriginalMinutes(r.startDatetime, r.endDatetime);
            const adjustedMinutes = r.workerActMins || 0;
            const minutesClass = adjustedMinutes < originalMinutes ? 'text-orange-600 font-semibold' : 'text-gray-900';
            const overlapInfo = adjustedMinutes < originalMinutes 
                ? `Overlap removed: -${(originalMinutes - adjustedMinutes)} min` 
                : 'No overlap';
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="p-2">${r.workingDay || '-'}</td>
                    <td class="p-2"><span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">${r.workingShift || '-'}</span></td>
                    <td class="p-2 text-gray-600 font-mono text-xs">${formatTime(r.startDatetime)}</td>
                    <td class="p-2 text-gray-600 font-mono text-xs">${formatTime(r.endDatetime)}</td>
                    <td class="p-2 font-medium">${r.foDesc3 || '-'}</td>
                    <td class="p-2 text-right text-gray-600">${originalMinutes}</td>
                    <td class="p-2 text-right ${minutesClass}" title="${overlapInfo}">
                        ${adjustedMinutes.toFixed(0)}
                    </td>
                </tr>
            `;
        })
        .join('');
}

// Render Work Efficiency records table
function renderEfficiencyTable(workerRecords, tableBody) {
    tableBody.innerHTML = workerRecords
        .sort((a, b) => new Date(b.startDatetime) - new Date(a.startDatetime))
        .map(r => {
            const st = r['Worker S/T'] || 0;
            const rate = r['Worker Rate(%)'] || 0;
            const assigned = st * rate / 100;
            const actual = r['Worker Act'] || 0;
            const efficiency = actual > 0 ? (assigned / actual) * 100 : 0;
            
            // Color code efficiency
            const efficiencyClass = efficiency >= 120 ? 'text-green-600 font-bold' :
                                   efficiency >= 100 ? 'text-blue-600 font-semibold' :
                                   efficiency >= 80 ? 'text-gray-600' :
                                   efficiency >= 60 ? 'text-orange-600' :
                                   'text-red-600 font-bold';
            
            return `
                <tr class="hover:bg-gray-50">
                    <td class="p-2">${r.workingDay || '-'}</td>
                    <td class="p-2"><span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">${r.workingShift || '-'}</span></td>
                    <td class="p-2 font-medium">${r.foDesc3 || '-'}</td>
                    <td class="p-2 text-right text-gray-600">${st}</td>
                    <td class="p-2 text-right text-gray-600">${rate}%</td>
                    <td class="p-2 text-right text-gray-900">${assigned.toFixed(1)}</td>
                    <td class="p-2 text-right text-gray-900">${actual}</td>
                    <td class="p-2 text-right ${efficiencyClass}">${efficiency.toFixed(1)}%</td>
                </tr>
            `;
        })
        .join('');
}

// Close Worker Detail Modal
function closeWorkerDetailModal(event) {
    if (!event || event.target.id === 'workerDetailModal') {
        document.getElementById('workerDetailModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Toggle between Time Utilization and Work Efficiency metrics
function toggleMetric() {
    // Add fade-out effect
    const reportTab = document.getElementById('reportTab');
    reportTab.style.transition = 'opacity 0.3s ease-in-out';
    reportTab.style.opacity = '0.5';
    
    // Toggle metric type
    AppState.currentMetricType = AppState.currentMetricType === 'utilization' ? 'efficiency' : 'utilization';
    
    const metricIcon = document.getElementById('metricIcon');
    const metricLabel = document.getElementById('metricLabel');
    const metricDescription = document.getElementById('metricDescription');
    const metricToggle = document.getElementById('metricToggle');
    
    // Get all primary buttons and active tabs
    const primaryButtons = document.querySelectorAll('.btn-primary');
    const activeTabs = document.querySelectorAll('.tab-active');
    
    if (AppState.currentMetricType === 'efficiency') {
        // Switch to Work Efficiency (Purple theme)
        document.body.style.transition = 'background-color 0.6s ease-in-out';
        document.body.style.backgroundColor = '#f3e8ff'; // More visible light purple
        
        metricIcon.className = 'fas fa-bolt text-purple-500 text-xl';
        metricLabel.textContent = 'Work Efficiency';
        metricDescription.textContent = 'Standard time vs actual performance';
        metricToggle.classList.remove('border-blue-500', 'hover:bg-blue-50');
        metricToggle.classList.add('border-purple-500', 'hover:bg-purple-50');
        
        // Change all primary buttons to purple
        primaryButtons.forEach(btn => {
            btn.style.background = 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)';
            btn.onmouseenter = () => {
                btn.style.background = 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)';
            };
            btn.onmouseleave = () => {
                btn.style.background = 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)';
            };
        });
        
        // Change active tab color to purple
        activeTabs.forEach(tab => {
            tab.style.borderBottomColor = '#a855f7';
            tab.style.color = '#a855f7';
        });
    } else {
        // Switch to Time Utilization (Blue theme)
        document.body.style.transition = 'background-color 0.6s ease-in-out';
        document.body.style.backgroundColor = '#dbeafe'; // More visible light blue
        
        metricIcon.className = 'fas fa-clock text-blue-500 text-xl';
        metricLabel.textContent = 'Time Utilization';
        metricDescription.textContent = 'Actual work time usage rate';
        metricToggle.classList.remove('border-purple-500', 'hover:bg-purple-50');
        metricToggle.classList.add('border-blue-500', 'hover:bg-blue-50');
        
        // Reset all primary buttons to blue
        primaryButtons.forEach(btn => {
            btn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            btn.onmouseenter = () => {
                btn.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            };
            btn.onmouseleave = () => {
                btn.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            };
        });
        
        // Reset active tab color to blue
        activeTabs.forEach(tab => {
            tab.style.borderBottomColor = '#3b82f6';
            tab.style.color = '#3b82f6';
        });
    }
    
    // Re-render the report with new metric (with delay for smooth transition)
    setTimeout(() => {
        updateReport();
        
        // Fade-in effect
        setTimeout(() => {
            reportTab.style.opacity = '1';
            
            // Reset body background after a while (increased duration for visibility)
            setTimeout(() => {
                document.body.style.backgroundColor = '';
            }, 3000);
        }, 100);
    }, 300);
    
    console.log(`🔄 Metric switched to: ${AppState.currentMetricType}`);
}

// Sort data table
function sortDataTable(column) {
    const sort = AppState.dataTableSort;
    
    // Toggle order if same column, otherwise default to desc
    if (sort.column === column) {
        sort.order = sort.order === 'asc' ? 'desc' : 'asc';
    } else {
        sort.column = column;
        sort.order = 'desc';
    }
    
    const data = [...AppState.cachedWorkerAgg];
    
    data.sort((a, b) => {
        let valA, valB;
        
        switch(column) {
            case 'workerName':
                valA = a.workerName || '';
                valB = b.workerName || '';
                break;
            case 'workingDay':
                valA = a.workingDay || '';
                valB = b.workingDay || '';
                break;
            case 'st':
                valA = a['Worker S/T'] || 0;
                valB = b['Worker S/T'] || 0;
                break;
            case 'assigned':
                valA = a.assignedStandardTime || 0;
                valB = b.assignedStandardTime || 0;
                break;
            case 'actual':
                valA = a.totalMinutesOriginal || 0;
                valB = b.totalMinutesOriginal || 0;
                break;
            case 'efficiencyRate':
                valA = a.efficiencyRate || 0;
                valB = b.efficiencyRate || 0;
                break;
            case 'totalMinutes':
                valA = a.totalMinutes || 0;
                valB = b.totalMinutes || 0;
                break;
            case 'utilizationRate':
                valA = a.utilizationRate || 0;
                valB = b.utilizationRate || 0;
                break;
            default:
                return 0;
        }
        
        if (typeof valA === 'string') {
            return sort.order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return sort.order === 'asc' ? valA - valB : valB - valA;
        }
    });
    
    updateDataTable(data);
}

// Filter data table by worker search
function filterDataTableByWorker(query) {
    if (!AppState.cachedWorkerAgg) return;
    
    const filtered = query 
        ? AppState.cachedWorkerAgg.filter(w => 
            w.workerName.toLowerCase().includes(query.toLowerCase())
          )
        : AppState.cachedWorkerAgg;
    
    updateDataTable(filtered);
}

// Make globally accessible functions
window.deleteMapping = deleteMapping;
window.sortMappingTable = sortMappingTable;
window.toggleCheckboxDropdown = toggleCheckboxDropdown;
window.updateCheckboxDisplay = updateCheckboxDisplay;
window.updateSingleSelect = updateSingleSelect;
window.selectAllMonthDates = selectAllMonthDates;
window.selectWeekDates = selectWeekDates;
window.toggleMonthDates = toggleMonthDates;
window.loadUploadById = loadUploadById;
window.deleteUpload = deleteUpload;
window.switchTab = switchTab;
window.sortPerformanceBand = sortPerformanceBand;
window.showWorkerDetail = showWorkerDetail;
window.closeWorkerDetailModal = closeWorkerDetailModal;
window.filterWorkerList = filterWorkerList;
window.toggleMetric = toggleMetric;
window.sortDataTable = sortDataTable; // ✅ NEW

