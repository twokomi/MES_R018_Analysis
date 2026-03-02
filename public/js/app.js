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

// ����� Process Mapping �칙 (FO Desc � FO Desc 2, FO Desc 3)
// Excel ��� Mapping ��가 �� � � �칙� 사�
const DEFAULT_PROCESS_MAPPING = {
  "Fitup Bracket": { foDesc2: "BT Complete", foDesc3: "Fitup Bracket", seq: 1 },
  "Weld Bracket": { foDesc2: "BT Complete", foDesc3: "Weld Bracket", seq: 2 },
  "Bracket VT/MT Repair": { foDesc2: "BT Complete", foDesc3: "Bracket VT/MT Repair", seq: 3 },
  "VT/MT Repair": { foDesc2: "BT Complete", foDesc3: "VT/MT Repair", seq: 4 },
  "UT Repair": { foDesc2: "BT Complete", foDesc3: "UT Repair", seq: 5 },
  "Tilt Repair": { foDesc2: "BT Complete", foDesc3: "Tilt Repair", seq: 6 },
  "Ovality Repair": { foDesc2: "BT Complete", foDesc3: "Ovality Repair", seq: 7 },
  "Flatness Repair": { foDesc2: "BT Complete", foDesc3: "Flatness Repair", seq: 8 },
  "Final Repair": { foDesc2: "BT Complete", foDesc3: "Final Repair", seq: 9 },
  "Pre-Blasting": { foDesc2: "BT Process", foDesc3: "Pre-Blasting", seq: 1 },
  "Cut": { foDesc2: "BT Process", foDesc3: "Cut", seq: 2 },
  "Bevel": { foDesc2: "BT Process", foDesc3: "Bevel", seq: 3 },
  "Bend": { foDesc2: "BT Process", foDesc3: "Bend", seq: 4 },
  "FU DS+Shell 2": { foDesc2: "BT Process", foDesc3: "FU DS+Shell 2", seq: 5 },
  "LSeam": { foDesc2: "BT Process", foDesc3: "LSeam", seq: 6 },
  "LS DS+Shell 2": { foDesc2: "BT Process", foDesc3: "LS DS+Shell 2", seq: 7 },
  "FU-C02": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C03": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C04": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C05": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C06": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C07": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C08": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C09": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C10": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-C11": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-LF": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "FU-UF": { foDesc2: "BT Process", foDesc3: "FU", seq: 8 },
  "CSI-C02": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C03": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C04": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C05": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C06": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C07": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C08": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C09": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C10": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-C11": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-LF": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSI-UF": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C02": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C03": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C04": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C05": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C06": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C07": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C08": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C09": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C10": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-C11": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-LF": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "CSO-UF": { foDesc2: "BT Process", foDesc3: "CS", seq: 9 },
  "QC VT/MT": { foDesc2: "BT QC", foDesc3: "QC VT/MT", seq: 1 },
  "QC VT1": { foDesc2: "BT QC", foDesc3: "QC VT/MT", seq: 2 },
  "QC VT2/MT": { foDesc2: "BT QC", foDesc3: "QC VT/MT", seq: 3 },
  "QC MT": { foDesc2: "BT QC", foDesc3: "QC MT", seq: 4 },
  "QC UT": { foDesc2: "BT QC", foDesc3: "QC UT", seq: 5 },
  "Flatness Inspection": { foDesc2: "BT QC", foDesc3: "Flatness Inspection", seq: 6 },
  "Final BT Inspection": { foDesc2: "BT QC", foDesc3: "Final BT Inspection", seq: 7 },
  "DS-CUT": { foDesc2: "DS", foDesc3: "DS-CUT", seq: 1 },
  "DS-BEV": { foDesc2: "DS", foDesc3: "DS-BEV", seq: 2 },
  "DS-BEN": { foDesc2: "DS", foDesc3: "DS-BEN", seq: 3 },
  "IM Pre-assembly Mounting": { foDesc2: "IM", foDesc3: "IM Pre-assembly Mounting", seq: 1 },
  "Mechanical": { foDesc2: "IM", foDesc3: "Mechanical", seq: 2 },
  "Electrical": { foDesc2: "IM", foDesc3: "Electrical", seq: 3 },
  "Final Touch Up": { foDesc2: "IM", foDesc3: "Final Touch Up", seq: 4 },
  "Flange Paint": { foDesc2: "IM", foDesc3: "Flange Paint", seq: 5 },
  "Final Cleaning": { foDesc2: "IM", foDesc3: "Final Cleaning", seq: 6 },
  "QC Pre-assembly Inspection": { foDesc2: "IM QC", foDesc3: "QC Pre-assembly Inspection", seq: 1 },
  "Assembly Inspection": { foDesc2: "IM QC", foDesc3: "Assembly Inspection", seq: 2 },
  "Final IM Inspection": { foDesc2: "IM QC", foDesc3: "Final IM Inspection", seq: 3 },
  "Wash": { foDesc2: "WT", foDesc3: "Wash", seq: 1 },
  "Blasting(TAP)": { foDesc2: "WT", foDesc3: "Blasting(TAP)", seq: 2 },
  "Blasting": { foDesc2: "WT", foDesc3: "Blasting", seq: 3 },
  "Metallizing": { foDesc2: "WT", foDesc3: "Metallizing", seq: 4 },
  "Ring on": { foDesc2: "WT", foDesc3: "Ring on", seq: 5 },
  "Paint1IO": { foDesc2: "WT", foDesc3: "Paint1IO", seq: 6 },
  "Paint2I": { foDesc2: "WT", foDesc3: "Paint2I", seq: 7 },
  "Paint2O": { foDesc2: "WT", foDesc3: "Paint2O", seq: 8 },
  "Final Paint Repair": { foDesc2: "WT", foDesc3: "Final Paint Repair", seq: 9 },
  "Ring off": { foDesc2: "WT", foDesc3: "Ring off", seq: 10 },
  "Wash Inspection": { foDesc2: "WT QC", foDesc3: "Wash Inspection", seq: 1 },
  "Blasting Inspection": { foDesc2: "WT QC", foDesc3: "Blasting Inspection", seq: 2 },
  "Metalizing Inspection": { foDesc2: "WT QC", foDesc3: "Metalizing Inspection", seq: 3 },
  "Paint1 Inspection": { foDesc2: "WT QC", foDesc3: "Paint1 Inspection", seq: 4 },
  "Final WT Inspection": { foDesc2: "WT QC", foDesc3: "Final WT Inspection", seq: 5 }
};
// Global state
const AppState = {
    rawData: [],
    processedData: [],
    aggregatedData: [], // NEW: Aggregated data for dashboard
    processMapping: [],
    shiftCalendar: [],
    currentFileName: '',
    currentFileSize: 0,
    allWorkers: [], // For worker search functionality
    currentMetricType: 'utilization', // 'utilization' or 'efficiency'
    outlierThreshold: 1000, //  Filter out rates > 1000% (configurable)
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
    filteredData: null, //  Store filtered data separately
    workerSummary: null, //  Store aggregated worker summary
    cachedWorkerAgg: null, //  Cache for search/sort
    dataTableSort: { column: null, order: 'desc' } //  Sort state
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
    
    // If Korean format like "02� 17�"
    if (typeof dateValue === 'string') {
        const match = dateValue.match(/(\d+)�\s*(\d+)�/);
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
    console.log('� App initializing...');
    try {
        initTabs();
        console.log(' Tabs initialized');
        
        //  Initialize tab colors based on current metric (default: Utilization = Blue)
        initTabColors();
        console.log(' Tab colors initialized');
        
        initFileUpload();
        console.log(' File upload initialized');
        initFilters();
        console.log(' Filters initialized');
        initMapping();
        console.log(' Mapping initialized');
        initDatabaseButtons();
        console.log(' Database buttons initialized');
        initViewToggle();
        console.log(' View toggle initialized');
        
        //  NEW: Outlier threshold control
        document.getElementById('applyThresholdBtn')?.addEventListener('click', () => {
            const input = document.getElementById('outlierThresholdInput');
            const value = parseInt(input.value) || 1000;
            AppState.outlierThreshold = value;
            console.log(` Outlier threshold updated: ${value}%`);
            
            // Show loading indicator
            const loadingIndicator = document.getElementById('filterLoadingIndicator');
            if (loadingIndicator) {
                loadingIndicator.classList.remove('hidden');
                loadingIndicator.style.opacity = '1';
            }
            
            // Use setTimeout to allow UI to update before heavy processing
            setTimeout(() => {
                updateReport();
                
                // Hide loading indicator with fade-out effect
                if (loadingIndicator) {
                    setTimeout(() => {
                        // Start fade-out
                        loadingIndicator.style.opacity = '0';
                        // Remove from DOM after fade completes
                        setTimeout(() => {
                            loadingIndicator.classList.add('hidden');
                        }, 300); // Match transition-opacity duration-300
                    }, 500);
                }
            }, 50);
        });
        
        //  NEW: Worker search
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
        console.log(' Shift calendar rendered');
        
        // Initialize calendar navigation
        initCalendarNavigation();
        console.log(' Calendar navigation initialized');
        
        console.log('� App fully initialized!');
    } catch (error) {
        console.error(' Initialization error:', error);
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
    console.log(` ${AppState.shiftCalendar.length} default Shift Calendar entries loaded (Feb-Apr 2026)`);
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

// Initialize tab colors based on current metric
function initTabColors() {
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    const activeColor = isEfficiency ? '#a855f7' : '#3b82f6'; // Purple for Efficiency, Blue for Utilization
    
    const activeTabs = document.querySelectorAll('.tab-active');
    activeTabs.forEach(tab => {
        tab.style.borderBottomColor = activeColor;
        tab.style.color = activeColor;
    });
}

// Switch to a specific tab
function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Determine current metric color
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    const activeColor = isEfficiency ? '#a855f7' : '#3b82f6'; // Purple for Efficiency, Blue for Utilization
    
    // Update active tab button
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('tab-active');
            // Apply current metric color
            btn.style.borderBottomColor = activeColor;
            btn.style.color = activeColor;
        } else {
            btn.classList.remove('tab-active');
            // Reset inline styles
            btn.style.borderBottomColor = '';
            btn.style.color = '';
        }
    });
    
    // Show target tab content
    tabContents.forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(tabName + 'Tab')?.classList.remove('hidden');
    
    // Initialize Dashboard when switching to dashboard tab
    if (tabName === 'dashboard') {
        console.log('🔍 Switching to Dashboard tab');
        console.log('  AppState.processedData exists:', !!AppState.processedData);
        console.log('  AppState.processedData.length:', AppState.processedData ? AppState.processedData.length : 0);
        console.log('  AppState.rawData.length:', AppState.rawData ? AppState.rawData.length : 0);
        
        if (typeof refreshExecutiveDashboard === 'function' && AppState.processedData && AppState.processedData.length > 0) {
            setTimeout(() => {
                refreshExecutiveDashboard();
                if (typeof initExecutiveDashboard === 'function') {
                    initExecutiveDashboard();
                }
            }, 100);
        } else {
            console.warn('⚠️ Cannot refresh dashboard: No processed data available');
            console.log('  Possible fix: Run updateReport() first or check data loading');
        }
    }
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
    showLoadingOverlay('Uploading Excel file...');
    
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
                console.log(' [DEBUG] Shift Calendar �� �견:', shiftCalendarSheetName);
                try {
                    const shiftCalendarSheet = workbook.Sheets[shiftCalendarSheetName];
                    const shiftCalendarData = XLSX.utils.sheet_to_json(shiftCalendarSheet, { header: 1, raw: false });
                    console.log(' [DEBUG] Shift Calendar ���� ���:', shiftCalendarData.length, '행');
                    
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
                            
                            console.log(` ${AppState.shiftCalendar.length}�� Shift Calendar ��목� ������.`);
                            console.log(' [DEBUG] First 3 shift calendar entries:', AppState.shiftCalendar.slice(0, 3));
                        }
                    }
                } catch (err) {
                    console.warn('Shift Calendar �� �� ��:', err);
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
                            console.log(` ${AppState.processMapping.length} process mappings loaded from Mapping sheet`);
                        }
                    }
                } catch (err) {
                    console.warn('�� �� �� ��:', err);
                }
            } else {
                // Mapping ��가 ��면 �� ���� �� 사�
                console.log('� Mapping ��가 ����. ����� �� ��� 사�����.');
                AppState.processMapping = [];
                
                // DEFAULT_PROCESS_MAPPING� AppState.processMapping ���� 변환
                Object.keys(DEFAULT_PROCESS_MAPPING).forEach(fdDesc => {
                    const mapping = DEFAULT_PROCESS_MAPPING[fdDesc];
                    AppState.processMapping.push({
                        fdDesc: fdDesc,
                        foDesc2: mapping.foDesc2,
                        foDesc3: mapping.foDesc3,
                        seq: mapping.seq || 999
                    });
                });
                
                updateMappingTable();
                console.log(` ${AppState.processMapping.length} process mappings loaded from DEFAULT_PROCESS_MAPPING`);
            }
            
            updateProgress(50);
            
            // Find Raw sheet (prefer 'Raw' sheet, fallback to first sheet)
            let rawSheetName = workbook.SheetNames.find(name => 
                normalizeHeader(name) === 'RAW'
            );
            
            // If no 'Raw' sheet found, use the first sheet
            if (!rawSheetName) {
                rawSheetName = workbook.SheetNames[0];
                console.log(`� 'Raw' ��를 찾� � �어 첫 �� ��를 사�����: "${rawSheetName}"`);
            } else {
                console.log(` 'Raw' ��를 찾����: "${rawSheetName}"`);
            }
            
            if (!rawSheetName) {
                throw new Error("Excel ��� ��가 ����.");
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
            console.log(' EXCEL HEADERS FROM FILE (Total: ' + headers.length + '):');
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
                throw new Error(`�� ���가 �������: ${missingHeaders.join(', ')}`);
            }
            
            updateProgress(80);
            
            // Parse data rows
            AppState.rawData = parseRawData(headers, dataRows);
            
            updateProgress(90);
            
            // Process data
            AppState.processedData = processData(AppState.rawData);
            
            // Aggregate data for dashboard
            AppState.aggregatedData = aggregateDataForDashboard(AppState.processedData);
            
            updateProgress(100);
            
            // Show success
            showUploadResult(AppState.processedData);
            
            // Update report
            updateReport();
            
            // Refresh Executive Dashboard if data exists
            if (typeof refreshExecutiveDashboard === 'function' && AppState.processedData && AppState.processedData.length > 0) {
                setTimeout(() => {
                    refreshExecutiveDashboard();
                    if (typeof initExecutiveDashboard === 'function') {
                        initExecutiveDashboard();
                    }
                }, 500);
            }
            
            // Store filename and size for later database save
            AppState.currentFileName = file.name;
            AppState.currentFileSize = file.size;
            
            setTimeout(() => {
                showUploadStatus(false);
                hideLoadingOverlay();
            }, 1000);
            
        } catch (error) {
            console.error('File parsing error:', error);
            alert('�� 처리 � 오류가 ������:\n' + error.message);
            showUploadStatus(false);
            hideLoadingOverlay();
        }
    };
    
    reader.onerror = function() {
        alert('��� �� � 오류가 ������.');
        showUploadStatus(false);
        hideLoadingOverlay();
    };
    
    reader.readAsArrayBuffer(file);
}

// Parse raw data
function parseRawData(headers, dataRows) {
    const parsed = [];
    
    // Log all headers for debugging
    console.log(' Excel headers (raw):', headers);
    console.log(' Excel headers (normalized):', headers.map(h => normalizeHeader(h)));
    
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
    const colActualShift = findColumnIndex(headers, 'actualshift');
    
    console.log(' Column indices:', {
        workerName: colWorkerName,
        workerST: colWorkerST,
        workerRate: colWorkerRate,
        workerAct: colWorkerAct,
        rework: colRework
    });
    
    //  DEBUG: Show actual Excel headers
    console.log(' Actual Excel headers (first 20):', headers.slice(0, 20));
    console.log(' Normalized headers (first 20):', headers.slice(0, 20).map(h => normalizeHeader(h)));
    
    //  CRITICAL: Check if Worker S/T or Rate columns are missing
    if (colWorkerST === -1) {
        console.error(' CRITICAL ERROR: Worker S/T column not found in Excel!');
        console.error('   Expected headers: Worker S/T, Worker ST, workerst, st, Standard Time');
        console.error('   Actual headers:', headers);
        console.error('   All Efficiency values will be 0.');
    }
    if (colWorkerRate === -1) {
        console.error(' CRITICAL ERROR: Worker Rate(%) column not found in Excel!');
        console.error('   Expected headers: Worker Rate(%), Worker Rate, workerrate, rate');
        console.error('   Actual headers:', headers);
        console.error('   All Efficiency values will be 0.');
    }
    
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
            resultCnt: row[colResultCnt],
            actualShift: colActualShift !== -1 ? (row[colActualShift] || '').toString().trim() : '' // Actual Shift (A/B/C)
        };
        
        parsed.push(record);
    });
    
    console.log(` Parsed ${parsed.length} records (Rework excluded: ${parsed.filter(r => r.rework).length})`);
    
    // Debug: Show first 3 records with S/T and Rate values
    if (parsed.length > 0) {
        console.log(' Sample parsed records (first 3):', parsed.slice(0, 3).map(r => ({
            worker: r.workerName,
            workerST: r.workerST,
            'Worker S/T': r['Worker S/T'],
            workerRate: r.workerRate,
            'Worker Rate(%)': r['Worker Rate(%)'],
            workerAct: r.workerAct,
            calculatedAssigned: (r['Worker S/T'] * r['Worker Rate(%)'] / 100).toFixed(2)
        })));
        
        //  CRITICAL: Check if Worker S/T and Rate columns are all zeros
        const allSTZero = parsed.every(r => r['Worker S/T'] === 0);
        const allRateZero = parsed.every(r => r['Worker Rate(%)'] === 0);
        
        if (allSTZero && allRateZero) {
            console.error(' CRITICAL ERROR: All Worker S/T and Worker Rate(%) values are 0!');
            console.error('   This will cause all Efficiency values to be 0.');
            console.error('   Excel column mapping may be incorrect.');
            console.error('   Check Excel headers: Worker S/T, Worker Rate(%)');
        } else if (allSTZero) {
            console.warn(' WARNING: All Worker S/T values are 0!');
        } else if (allRateZero) {
            console.warn(' WARNING: All Worker Rate(%) values are 0!');
        }
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
    
    console.log(`�  Checking for overlapping time intervals...`);
    
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
        console.log(`  Found ${totalOverlaps} overlapping intervals`);
        console.log(`� Total overlap time removed: ${totalOverlapMinutes.toFixed(1)} minutes`);
    } else {
        console.log(` No overlapping intervals found`);
    }
    
    return records;
}

// Process data in chunks to avoid blocking UI (for large datasets)
async function processDataInChunks(rawData, chunkSize = 1000) {
    const processed = [];
    const totalChunks = Math.ceil(rawData.length / chunkSize);
    
    console.log(`� Processing ${rawData.length} records in ${totalChunks} chunks of ${chunkSize}...`);
    
    for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, rawData.length);
        const chunk = rawData.slice(start, end);
        
        // Process chunk
        const chunkProcessed = processData(chunk);
        processed.push(...chunkProcessed);
        
        // Update progress
        const progress = Math.round((i + 1) / totalChunks * 100);
        console.log(`  Chunk ${i + 1}/${totalChunks} processed (${progress}%)`);
        
        // Allow UI to update every 5 chunks
        if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
    
    console.log(` All chunks processed: ${processed.length} records`);
    return processed;
}

// Process data (calculate Working Day, Shift, apply mapping)
function processData(rawData) {
    const processed = [];
    
    console.log(` Processing ${rawData.length} raw records...`);
    console.log(` Current mappings count: ${AppState.processMapping.length}`);
    
    // Debug: Show first few mappings
    if (AppState.processMapping.length > 0) {
        console.log(` Sample mappings:`, AppState.processMapping.slice(0, 3).map(m => 
            `${m.fdDesc} � ${m.foDesc2} / ${m.foDesc3} (Seq: ${m.seq})`
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
        
        // Determine Actual Shift (A/B/C) from Excel or ShiftCalendar
        let actualShift = record.actualShift || '';
        if (!actualShift && workingDay && AppState.shiftCalendar.length > 0) {
            const calendarEntry = AppState.shiftCalendar.find(entry => entry.date === workingDay);
            if (calendarEntry) {
                actualShift = workingShift === 'Day' ? calendarEntry.dayShift : calendarEntry.nightShift;
            }
        }
        
        // Determine valid flag
        const validFlag = isValidResult(record.resultCnt) ? 1 : 0;
        
        // Apply process mapping
        const mapping = findProcessMapping(record.fdDesc);
        
        if (mapping.status === 'OK') {
            mappedCount++;
        } else if (mapping.status === 'Not Found') {
            notFoundCount++;
        }
        
        // Calculate utilization and efficiency rates
        // Utilization = (Worker Act Mins / 660) * 100
        // Efficiency = (Worker S/T / Worker Act Mins) * 100
        const workerActMins = parseFloat(record.workerActMins) || 0;
        const workerST = parseFloat(record.workerST) || 0;
        
        let utilizationRate = 0;
        let efficiencyRate = 0;
        
        if (workerActMins > 0) {
            // Utilization: percentage of shift time used (660 minutes = 11 hours)
            utilizationRate = (workerActMins / 660) * 100;
            
            // Efficiency: standard time vs actual time
            if (workerST > 0) {
                efficiencyRate = (workerST / workerActMins) * 100;
            }
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
            mappingStatus: mapping.status,
            utilizationRate: utilizationRate,
            efficiencyRate: efficiencyRate
        };
        
        processed.push(processedRecord);
    });
    
    console.log(` Mapping results: ${mappedCount} matched, ${notFoundCount} not found`);
    
    // Calculate overall statistics
    let totalUtil = 0, totalEff = 0, validCount = 0;
    const shiftCount = { A: 0, B: 0, C: 0, unknown: 0 };
    processed.forEach(r => {
        if (r.utilizationRate > 0) {
            totalUtil += r.utilizationRate;
            validCount++;
        }
        if (r.efficiencyRate > 0) {
            totalEff += r.efficiencyRate;
        }
        // Count actual shifts
        if (r.actualShift === 'A') shiftCount.A++;
        else if (r.actualShift === 'B') shiftCount.B++;
        else if (r.actualShift === 'C') shiftCount.C++;
        else shiftCount.unknown++;
    });
    const avgUtil = validCount > 0 ? (totalUtil / validCount).toFixed(2) : 0;
    const avgEff = validCount > 0 ? (totalEff / validCount).toFixed(2) : 0;
    console.log(` Calculated rates: Avg Util=${avgUtil}%, Avg Eff=${avgEff}%, Valid records=${validCount}`);
    console.log(` Actual Shift distribution: A=${shiftCount.A}, B=${shiftCount.B}, C=${shiftCount.C}, Unknown=${shiftCount.unknown}`);
    
    // Debug: Show sample records with detailed info
    if (processed.length > 0) {
        const sampleRecords = processed.slice(0, 3);
        console.log(` Sample records for validation:`);
        sampleRecords.forEach((r, idx) => {
            const datetime = r.startDatetime || r.endDatetime;
            const timeStr = datetime ? datetime.toISOString() : 'N/A';
            console.log(`  [${idx+1}] Worker: ${r.workerName}, Process: ${r.foDesc3}, Category: ${r.foDesc2}`);
            console.log(`      DateTime: ${timeStr}`);
            console.log(`      Working Day: ${r.workingDay}, Shift: ${r.workingShift}, Actual: ${r.actualShift}`);
            console.log(`      Result Cnt: "${r.resultCnt}", Valid: ${r.validFlag}, Minutes: ${r.workerActMins}`);
            console.log(`       RATES: Util=${r.utilizationRate?.toFixed(1)}%, Eff=${r.efficiencyRate?.toFixed(1)}%`);
            console.log(`       RAW DATA: Worker S/T=${r.workerST}, Worker Act Mins=${r.workerActMins}`);
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
    console.log(`� Unique categories (FO Desc 2): ${uniqueCategories.length}`, uniqueCategories);
    console.log(` Category counts:`, categoryCount);
    
    // Debug: Show unique processes with their Seq
    const processSeqMap = {};
    processed.forEach(r => {
        if (!processSeqMap[r.foDesc3]) {
            processSeqMap[r.foDesc3] = r.seq;
        }
    });
    
    const sortedProcesses = Object.entries(processSeqMap)
        .sort((a, b) => a[1] - b[1]);
    
    console.log(' Processes with Seq:', sortedProcesses.map(([name, seq]) => `${name} (Seq: ${seq})`).join(', '));
    
    // Debug: Show date/shift distribution
    const dateShiftCount = {};
    processed.forEach(r => {
        const key = `${r.workingDay}_${r.actualShift}_${r.workingShift}`;
        dateShiftCount[key] = (dateShiftCount[key] || 0) + 1;
    });
    console.log(' Date/Shift distribution:', dateShiftCount);
    
    // Merge overlapping time intervals for each worker
    mergeOverlappingIntervals(processed);
    
    return processed;
}

// ========================================
// NEW: Aggregate processed data for dashboard
// ========================================
function aggregateDataForDashboard(processedData) {
    console.log(' Starting data aggregation for dashboard...');
    
    // Group by: Worker + Date + Shift
    const aggregated = {};
    
    processedData.forEach(record => {
        if (!record.validFlag || !record.workerName || !record.workingDay) return;
        
        const key = `${record.workerName}|${record.workingDay}|${record.workingShift}|${record.actualShift}`;
        
        if (!aggregated[key]) {
            aggregated[key] = {
                workerName: record.workerName,
                workingDay: record.workingDay,
                workingShift: record.workingShift,
                actualShift: record.actualShift,
                foDesc2: record.foDesc2,
                foDesc3: record.foDesc3,
                seq: record.seq,
                totalActualMins: 0,
                totalStandardTime: 0,
                recordCount: 0,
                records: []
            };
        }
        
        aggregated[key].totalActualMins += record.workerActMins || 0;
        
        // Calculate assigned standard time: Worker S/T � Worker Rate(%) / 100
        const st = record.workerST || record['Worker S/T'] || 0;
        const rate = record.workerRate || record['Worker Rate(%)'] || 0;
        const assignedST = (st * rate / 100);
        
        aggregated[key].totalStandardTime += assignedST;
        aggregated[key].recordCount++;
        aggregated[key].records.push(record);
    });
    
    // Calculate rates for each aggregated entry
    const aggregatedArray = Object.values(aggregated).map(agg => {
        // Count unique shifts
        const shiftCount = agg.records.length > 0 
            ? new Set(agg.records.map(r => `${r.workingDay}_${r.workingShift}`)).size 
            : 1;
        
        // Utilization: total actual minutes / (660 min � shift count)
        const utilization = shiftCount > 0 ? (agg.totalActualMins / (660 * shiftCount)) * 100 : 0;
        
        // Efficiency: total assigned standard time / (660 min � shift count)
        const shiftTime = shiftCount * 660;
        const efficiency = shiftTime > 0 
            ? (agg.totalStandardTime / shiftTime) * 100 
            : 0;
        
        return {
            ...agg,
            shiftCount: shiftCount,
            utilizationRate: utilization,
            efficiencyRate: efficiency
        };
    });
    
    console.log(` Aggregated ${aggregatedArray.length} worker-day-shift entries`);
    
    // Calculate overall statistics
    const avgUtil = aggregatedArray.length > 0 
        ? (aggregatedArray.reduce((s, a) => s + a.utilizationRate, 0) / aggregatedArray.length).toFixed(1)
        : 0;
    const avgEff = aggregatedArray.length > 0
        ? (aggregatedArray.reduce((s, a) => s + a.efficiencyRate, 0) / aggregatedArray.length).toFixed(1)
        : 0;
    
    console.log(` Overall aggregated stats: Avg Util=${avgUtil}%, Avg Eff=${avgEff}%`);
    console.log(` Sample aggregated data:`, aggregatedArray.slice(0, 3).map(a => ({
        worker: a.workerName,
        date: a.workingDay,
        shift: a.workingShift,
        actualShift: a.actualShift,
        process: a.foDesc2,
        util: a.utilizationRate.toFixed(1) + '%',
        eff: a.efficiencyRate.toFixed(1) + '%',
        records: a.recordCount,
        totalActual: a.totalActualMins,
        totalST: a.totalStandardTime
    })));
    
    return aggregatedArray;
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
        
        // CRITICAL: Night shift spans two calendar days
        // Night shift always belongs to the day it STARTS (18:00)
        // If time is 00:00-05:59, it's the continuation of previous day's night shift
        // So we need to go back TWO days from the current datetime
        if (timeInMinutes < dayStartMinutes) {
            // 00:00-05:59: This is the END of night shift that started on (date-1) at 18:00
            // So working day = (date - 1)
            workingDay.setDate(workingDay.getDate() - 1);
        }
        // If time is 18:00-23:59, working day stays the same (night shift just started)
    }
    
    // Format as YYYY-MM-DD
    const workingDayStr = workingDay.toISOString().split('T')[0];
    
    console.log(` calculateWorkingDayShift: ${datetime.toISOString()} (${hours}:${minutes.toString().padStart(2,'0')}) � ${workingDayStr} ${workingShift}`);
    
    return {
        workingDay: workingDayStr,
        workingShift: workingShift
    };
}

// Note: Shift filtering is now handled directly in getFilteredData()
// using ShiftCalendar to determine which dates each shift works on

// Check if result should be counted (CHANGED: count ALL records)
//  Result CNT와 무관�� �� ���를 valid� 처리
// Result CNT� ������ 사��
function isValidResult(resultCnt) {
    return true; // Count all records regardless of Result CNT
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
            // Fallback: if no shift calendar, show all dates (cannot filter by shift)
            console.warn(' No shift calendar available - showing all dates');
            availableDates = [...new Set(AppState.processedData.map(d => d.workingDay))].filter(d => d).sort();
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
        
        // Calculate week number (ISO week) using local dates to avoid timezone issues
        const [yearNum, monthNum, dayNum] = date.split('-').map(Number);
        const d = new Date(yearNum, monthNum - 1, dayNum); // Local date
        const dayOfWeek = d.getDay() || 7; // Sunday = 7
        const mondayDate = dayNum - dayOfWeek + 1; // Monday's day of month
        const weekStartDate = new Date(yearNum, monthNum - 1, mondayDate);
        const weekKey = `${yearNum}-${String(weekStartDate.getMonth() + 1).padStart(2, '0')}-${String(weekStartDate.getDate()).padStart(2, '0')}`;
        
        // Debug log for ALL dates to verify week calculation
        console.log(` ${date} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}) � Week ${weekKey} (Mon)`);

        
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
            
            // Calculate week end date (Sunday = Monday + 6 days)
            // Use local date parsing to avoid timezone issues
            const [yearNum, monthNum, dayNum] = weekStart.split('-').map(Number);
            const weekStartDate = new Date(yearNum, monthNum - 1, dayNum); // Local date
            const weekEndDate = new Date(yearNum, monthNum - 1, dayNum + 6); // Add 6 days
            
            const weekStartStr = weekStart.substring(5); // MM-DD
            const weekEndStr = `${String(weekEndDate.getMonth() + 1).padStart(2, '0')}-${String(weekEndDate.getDate()).padStart(2, '0')}`;
            
            // Calculate ISO week number
            const d = new Date(yearNum, monthNum - 1, dayNum);
            const yearStart = new Date(d.getFullYear(), 0, 1);
            const weekNum = Math.ceil((((d - yearStart) / 86400000) + yearStart.getDay() + 1) / 7);
            
            const weekLabel = `WK${weekNum}: ${weekStartStr} ~ ${weekEndStr}`;
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
    
    console.log(` Updating filter options with ${data.length} records`);
    
    // Update working day options based on current shift filter
    const selectedShift = getRadioValue('shift');
    updateWorkingDayOptions(selectedShift);
    
    // Save currently checked items BEFORE updating
    const checkedCategories = Array.from(document.querySelectorAll('.category-checkbox:checked')).map(cb => cb.value);
    const checkedProcesses = Array.from(document.querySelectorAll('.process-checkbox:checked')).map(cb => cb.value);
    const checkedWorkers = Array.from(document.querySelectorAll('.worker-checkbox:checked')).map(cb => cb.value);
    
    // Category (FO Desc 2) - Use all categories from CATEGORY_ORDER
    const uniqueCategories = Object.keys(CATEGORY_ORDER)
        .filter(c => c !== 'Other') // Exclude 'Other' from filter
        .sort((a, b) => {
            const orderA = CATEGORY_ORDER[a] || 999;
            const orderB = CATEGORY_ORDER[b] || 999;
            return orderA - orderB;
        });
    console.log(`� Showing ${uniqueCategories.length} categories (from CATEGORY_ORDER):`, uniqueCategories);
    
    const categoryDropdown = document.getElementById('filterCategoryDropdown');
    if (categoryDropdown) {
        const allChecked = checkedCategories.length === 0 || checkedCategories.length === uniqueCategories.length;
        categoryDropdown.innerHTML = `
            <label class="flex items-center px-3 py-2 hover:bg-blue-100 cursor-pointer border-b-2 border-gray-300 bg-gray-50 font-semibold">
                <input type="checkbox" value="__ALL__" class="mr-3 h-4 w-4 text-blue-600 category-checkbox" onchange="toggleAllCheckboxes('category')" ${allChecked ? 'checked' : ''}>
                <span class="text-sm text-blue-700">All Categories</span>
            </label>
        ` + uniqueCategories.map(category => `
            <label class="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100">
                <input type="checkbox" value="${category}" class="mr-3 h-4 w-4 text-blue-600 category-checkbox" onchange="updateCheckboxDisplay('category')" ${checkedCategories.includes(category) ? 'checked' : ''}>
                <span class="text-sm text-gray-700">${category}</span>
            </label>
        `).join('');
    }
    console.log(` Category dropdown updated with ${uniqueCategories.length} options`);
    
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
        const allChecked = checkedProcesses.length === 0 || checkedProcesses.length === processes.length;
        processDropdown.innerHTML = `
            <label class="flex items-center px-3 py-2 hover:bg-blue-100 cursor-pointer border-b-2 border-gray-300 bg-gray-50 font-semibold">
                <input type="checkbox" value="__ALL__" class="mr-3 h-4 w-4 text-blue-600 process-checkbox" onchange="toggleAllCheckboxes('process')" ${allChecked ? 'checked' : ''}>
                <span class="text-sm text-blue-700">All Processes</span>
            </label>
        ` + processes.map(process => `
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
        const allChecked = checkedWorkers.length === 0 || checkedWorkers.length === uniqueWorkers.length;
        workerList.innerHTML = `
            <label class="flex items-center px-3 py-2 hover:bg-blue-100 cursor-pointer border-b-2 border-gray-300 bg-gray-50 font-semibold worker-item">
                <input type="checkbox" value="__ALL__" class="mr-3 h-4 w-4 text-blue-600 worker-checkbox" onchange="toggleAllCheckboxes('worker')" ${allChecked ? 'checked' : ''}>
                <span class="text-sm text-blue-700">All Workers</span>
            </label>
        ` + uniqueWorkers.map(worker => `
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

// Toggle all checkboxes for a filter type
function toggleAllCheckboxes(type) {
    const allCheckbox = document.querySelector(`.${type}-checkbox[value="__ALL__"]`);
    const itemCheckboxes = document.querySelectorAll(`.${type}-checkbox:not([value="__ALL__"])`);
    
    if (allCheckbox && allCheckbox.checked) {
        // Check all items
        itemCheckboxes.forEach(cb => cb.checked = true);
    } else {
        // Uncheck all items
        itemCheckboxes.forEach(cb => cb.checked = false);
    }
    
    updateCheckboxDisplay(type);
}

// Update checkbox display
function updateCheckboxDisplay(type) {
    const checkboxes = document.querySelectorAll(`.${type}-checkbox:checked:not([value="__ALL__"])`);
    const selected = Array.from(checkboxes).map(cb => cb.value).filter(v => v);
    const displayBtn = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}Display`);
    
    // Update "All" checkbox state
    const allCheckbox = document.querySelector(`.${type}-checkbox[value="__ALL__"]`);
    const allItemCheckboxes = document.querySelectorAll(`.${type}-checkbox:not([value="__ALL__"])`);
    const allChecked = Array.from(allItemCheckboxes).every(cb => cb.checked);
    if (allCheckbox) {
        allCheckbox.checked = allChecked;
    }
    
    if (displayBtn) {
        const textSpan = displayBtn.querySelector('span');
        if (selected.length === 0) {
            textSpan.textContent = 'Select...';
            textSpan.className = 'text-gray-500';
        } else if (allChecked) {
            textSpan.textContent = 'All';
            textSpan.className = 'text-blue-700 font-semibold';
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
    // Show loading indicator
    const loadingIndicator = document.getElementById('filterLoadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
        loadingIndicator.style.opacity = '1';
    }
    
    // Get checked working days
    const dayCheckboxes = document.querySelectorAll('.workingDay-checkbox:checked');
    const selectedDays = Array.from(dayCheckboxes).map(cb => cb.value).filter(v => v);
    
    // Get checked categories
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox:checked');
    const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value).filter(v => v && v !== '__ALL__');
    
    // Get checked processes
    const processCheckboxes = document.querySelectorAll('.process-checkbox:checked');
    const selectedProcesses = Array.from(processCheckboxes).map(cb => cb.value).filter(v => v && v !== '__ALL__');
    
    // Get checked workers
    const workerCheckboxes = document.querySelectorAll('.worker-checkbox:checked');
    const selectedWorkers = Array.from(workerCheckboxes).map(cb => cb.value).filter(v => v && v !== '__ALL__');
    
    AppState.filters = {
        shift: getRadioValue('shift'),
        workingDays: selectedDays,
        workingShift: getRadioValue('workingShift'),
        categories: selectedCategories,
        processes: selectedProcesses,
        workers: selectedWorkers
    };
    
    console.log(' Applied filters:', AppState.filters);
    
    // Close all dropdowns after applying filters
    document.getElementById('filterWorkingDayDropdown')?.classList.add('hidden');
    document.getElementById('filterCategoryDropdown')?.classList.add('hidden');
    document.getElementById('filterProcessDropdown')?.classList.add('hidden');
    document.getElementById('filterWorkerDropdown')?.classList.add('hidden');
    document.getElementById('filterWorkingShiftDropdown')?.classList.add('hidden');
    
    // Use setTimeout to allow UI to update before heavy processing
    setTimeout(() => {
        updateReport();
        
        // Hide loading indicator with fade-out effect
        if (loadingIndicator) {
            setTimeout(() => {
                // Start fade-out
                loadingIndicator.style.opacity = '0';
                // Remove from DOM after fade completes
                setTimeout(() => {
                    loadingIndicator.classList.add('hidden');
                }, 300); // Match transition-opacity duration-300
            }, 500); // Keep visible for at least 500ms for smooth UX
        }
    }, 50);
}

// Reset filters
function resetFilters() {
    // Show loading indicator
    const loadingIndicator = document.getElementById('filterLoadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
        loadingIndicator.style.opacity = '1';
        // Update text for reset action
        const textElement = loadingIndicator.querySelector('span.text-xs');
        if (textElement) textElement.textContent = 'Resetting filters';
    }
    
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
    
    // Use setTimeout to allow UI to update before heavy processing
    setTimeout(() => {
        updateFilterOptions();
        updateReport();
        
        // Hide loading indicator with fade-out and restore text
        if (loadingIndicator) {
            setTimeout(() => {
                // Start fade-out
                loadingIndicator.style.opacity = '0';
                // Remove from DOM after fade completes
                setTimeout(() => {
                    loadingIndicator.classList.add('hidden');
                    const textElement = loadingIndicator.querySelector('span.text-xs');
                    if (textElement) textElement.textContent = 'Applying filters';
                }, 300); // Match transition-opacity duration-300
            }, 500);
        }
    }, 50);
}

// Get filtered data
function getFilteredData() {
    let filtered = AppState.processedData;
    
    console.log(` Starting filter with ${filtered.length} records`);
    console.log('Applied filters:', AppState.filters);
    
    // Filter by shift (A/B/C)
    // ShiftCalendar shows which dates each shift works on
    // e.g., "2026-02-09 � Day Shift A" means Shift A works on 2026-02-09 (Day)
    if (AppState.filters.shift) {
        console.log(` Filtering by Shift ${AppState.filters.shift}`);
        
        if (AppState.shiftCalendar && AppState.shiftCalendar.length > 0) {
            // Find all dates where the selected shift is working
            const workingDates = new Set();
            
            AppState.shiftCalendar.forEach(entry => {
                if (entry.dayShift === AppState.filters.shift) {
                    workingDates.add(`${entry.date}|Day`);
                }
                if (entry.nightShift === AppState.filters.shift) {
                    workingDates.add(`${entry.date}|Night`);
                }
            });
            
            console.log(` Shift ${AppState.filters.shift} works on ${workingDates.size} date+shift combinations`);
            console.log('Sample working dates:', Array.from(workingDates).slice(0, 10));
            
            // DEBUG: Check for records that don't match ShiftCalendar
            const beforeCount = filtered.length;
            const unmatchedRecords = filtered.filter(record => {
                const key = `${record.workingDay}|${record.workingShift}`;
                return !workingDates.has(key);
            });
            
            if (unmatchedRecords.length > 0) {
                console.log(` Found ${unmatchedRecords.length} records NOT in ShiftCalendar:`);
                const unmatchedDates = new Set(unmatchedRecords.map(r => `${r.workingDay}|${r.workingShift}`));
                console.log('Sample unmatched date+shift combinations:', Array.from(unmatchedDates).slice(0, 10));
            }
            
            // Filter records: keep only if worker's date+shift matches shift calendar
            filtered = filtered.filter(record => {
                const key = `${record.workingDay}|${record.workingShift}`;
                return workingDates.has(key);
            });
            
            console.log(`After shift filter (${AppState.filters.shift}): ${filtered.length} records (removed ${beforeCount - filtered.length})`);
        } else {
            console.warn(' ShiftCalendar not found or empty - cannot filter by shift');
            filtered = [];
        }
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
    
    console.log(` Final filtered: ${filtered.length} records`);
    
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
    
    // Show Report sections when data is available
    if (filteredData.length > 0) {
        document.getElementById('performanceBands')?.classList.remove('hidden');
        document.getElementById('reportCharts')?.classList.remove('hidden');
        document.getElementById('reportTable')?.classList.remove('hidden');
    }
    
    // Store filtered data in AppState for use in Worker Detail modal
    AppState.filteredData = filteredData;
    
    //  DEBUG: Check Day+Night overlap workers and their actual time distribution
    if (AppState.filters.workingShift === 'All') {
        const dayData = filteredData.filter(r => r.workingShift === 'Day');
        const nightData = filteredData.filter(r => r.workingShift === 'Night');
        
        const dayWorkers = new Set(dayData.map(r => r.workerName));
        const nightWorkers = new Set(nightData.map(r => r.workerName));
        
        const overlapWorkers = [...dayWorkers].filter(w => nightWorkers.has(w));
        
        console.log(`\n DEBUG: Day+Night Overlap Analysis`);
        console.log(`Total overlap workers: ${overlapWorkers.length}`);
        
        // Sample first 3 overlap workers
        overlapWorkers.slice(0, 3).forEach(workerName => {
            const workerDayRecords = dayData.filter(r => r.workerName === workerName);
            const workerNightRecords = nightData.filter(r => r.workerName === workerName);
            
            const dayTotalMinutes = workerDayRecords.reduce((sum, r) => sum + (r.workerActMins || 0), 0);
            const nightTotalMinutes = workerNightRecords.reduce((sum, r) => sum + (r.workerActMins || 0), 0);
            
            console.log(`\n� ${workerName}`);
            console.log(`  Day: ${workerDayRecords.length} records, ${dayTotalMinutes} minutes (${(dayTotalMinutes/60).toFixed(1)} hrs)`);
            console.log(`  Night: ${workerNightRecords.length} records, ${nightTotalMinutes} minutes (${(nightTotalMinutes/60).toFixed(1)} hrs)`);
            console.log(`  Ratio: Day ${(dayTotalMinutes/(dayTotalMinutes+nightTotalMinutes)*100).toFixed(1)}% / Night ${(nightTotalMinutes/(dayTotalMinutes+nightTotalMinutes)*100).toFixed(1)}%`);
        });
    }
    
    // Aggregate by worker (detailed: worker+date+shift+process)
    const workerAgg = aggregateByWorker(filteredData);
    
    //  Cache for search/sort
    AppState.cachedWorkerAgg = workerAgg;
    
    // Aggregate by worker only (for Performance Bands and Charts)
    const workerSummary = aggregateByWorkerOnly(workerAgg);
    
    //  FIX: Cache workerSummary for Performance Band sorting
    AppState.workerSummary = workerSummary;
    
    updateKPIs(workerSummary); //  FIXED: Use workerSummary instead of workerAgg
    updatePerformanceBands(workerSummary); // Use worker summary for bands
    updateCharts(workerSummary, filteredData); // Use worker summary for charts
    updateDataTable(workerAgg);
    updatePivotReport(workerAgg);
    
    //  NEW: Update Dashboard after filtering
    if (typeof refreshDashboard === 'function') {
        refreshDashboard();
    }
}

// Aggregate by worker only (consolidate all records per worker)
function aggregateByWorkerOnly(workerAgg) {
    //  FIX: Use workerAgg directly instead of re-processing original data
    // This ensures outliers already filtered in aggregateByWorker() stay filtered
    const byWorker = {};
    
    console.log(` aggregateByWorkerOnly: Processing ${workerAgg.length} pre-aggregated records`);
    
    // Process pre-aggregated workerAgg data
    workerAgg.forEach(item => {
        const workerName = item.workerName;
        
        //  Include ALL records (outliers are real work)
        // Outliers will be visually marked but included in calculations
        
        if (!byWorker[workerName]) {
            byWorker[workerName] = {
                workerName: workerName,
                totalMinutes: 0, // For Time Utilization (overlap-removed)
                totalMinutesOriginal: 0, // For Work Efficiency (original Worker Act)
                assignedStandardTime: 0, // For Work Efficiency
                'Worker S/T': 0, //  NEW: Total Standard Time
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
        byWorker[workerName]['Worker S/T'] += item['Worker S/T'] || 0; //  NEW: Accumulate S/T
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
    
    console.log(` Worker Summary:
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
        
        // Calculate Time Utilization Rate: total work time / (660 min * shift count) � 100
        const utilizationRate = shiftCount > 0 ? (worker.totalMinutes / (660 * shiftCount)) * 100 : 0;
        const utilizationBand = getUtilizationBand(utilizationRate);
        
        // Calculate Work Efficiency Rate: assigned standard time / shift time � 100
        // Shift-based productivity: How much standard work completed per shift (660 min)
        const shiftTime = shiftCount * 660; // Total available shift time
        const efficiencyRate = shiftTime > 0 
            ? (worker.assignedStandardTime / shiftTime) * 100 
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
    
    // � No filtering at Worker Total level (already filtered at W/O level in aggregateByWorker)
    // Logic: If all W/O records are �� threshold, then Worker Total (average) must also be �� threshold
    console.log(`� Worker Total level: No additional filtering needed (already filtered at W/O level)`);
    
    console.log(' Worker Summary (Top 5):', result.slice(0, 5).map(w => ({
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
        pivotDiv.innerHTML = '<p class="text-gray-500 text-center py-8">����를 ����� ���를 ����주��</p>';
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
            totalMinutesOriginal: item.totalMinutesOriginal || 0,
            'Worker S/T': item['Worker S/T'] || 0, //  FIX: Add Worker S/T for Pivot Report
            assignedStandardTime: item.assignedStandardTime || 0,
            workerRate: item['Worker Rate(%)'] || 0,
            workRate: item.workRate,
            efficiencyRate: item.efficiencyRate || 0
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
        const isEfficiency = AppState.currentMetricType === 'efficiency';
        const colspan = isEfficiency ? 5 : 3; // Changed from 6 to 5
        html += `<th colspan="${colspan}">${date}</th>`;
    });
    html += '</tr>';
    
    html += '<tr>';
    allDates.forEach(() => {
        const isEfficiency = AppState.currentMetricType === 'efficiency';
        if (isEfficiency) {
            html += `<th style="font-size: 0.7rem;">S/T(m)</th>`;
            html += `<th style="font-size: 0.7rem;">Rate(%)</th>`;
            html += `<th style="font-size: 0.7rem;">Adjusted S/T(m)</th>`;
            html += `<th style="font-size: 0.7rem;">Efficiency(%)</th>`;
            html += `<th style="font-size: 0.7rem;">WO#</th>`;
        } else {
            html += `<th style="font-size: 0.7rem;">WO Count</th>`;
            html += `<th style="font-size: 0.7rem;">Work Time(m)</th>`;
            html += `<th style="font-size: 0.7rem;">Utilization</th>`;
        }
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
    
    console.log(' Pivot Report Process Order:', sortedProcesses.map(([name, data]) => `${name} (Seq: ${data.seq})`));
    
    sortedProcesses.forEach(([processName, processData]) => {
        // Process header row - LEFT ALIGNED
        const isEfficiency = AppState.currentMetricType === 'efficiency';
        const colsPerDate = isEfficiency ? 5 : 3; // Changed from 6 to 5
        html += `<tr><td colspan="${1 + allDates.length * colsPerDate}" class="process-cell" style="text-align: left; padding-left: 1rem; font-weight: 700; font-size: 0.95rem;">${processName}</td></tr>`;
        
        // Worker rows
        const sortedWorkers = Object.keys(processData.workers).sort();
        sortedWorkers.forEach(workerName => {
            html += '<tr>';
            html += `<td class="worker-cell" style="text-align: left; padding-left: 2rem;">${workerName}</td>`;
            
            allDates.forEach(date => {
                const dateData = processData.workers[workerName][date];
                const isEfficiency = AppState.currentMetricType === 'efficiency';
                
                if (dateData) {
                    if (isEfficiency) {
                        // Efficiency Mode: S/T, Rate, Adjusted S/T, Efficiency, WO Count
                        const st = dateData['Worker S/T'] || 0; // Standard Time (baseline)
                        const adjusted = dateData.assignedStandardTime || 0; // Adjusted = S/T � Rate ÷ 100
                        const rate = st > 0 ? (adjusted / st) * 100 : 0; // Rate = Adjusted ÷ S/T � 100
                        const woCount = dateData.validCount || 0; // Number of work orders
                        
                        // Calculate daily efficiency: Adjusted S/T ÷ (Shift Count � 660) � 100
                        // Count unique shifts for this worker on this date
                        const shiftsForDate = new Set();
                        Object.entries(processData.workers[workerName]).forEach(([d, data]) => {
                            if (d === date && data.workingShift) {
                                shiftsForDate.add(data.workingShift);
                            }
                        });
                        const shiftCount = shiftsForDate.size || 1;
                        const shiftTime = shiftCount * 660;
                        const efficiency = shiftTime > 0 ? (adjusted / shiftTime) * 100 : 0;
                        
                        // Display: S/T, Rate, Adjusted S/T, Efficiency (%), WO Count
                        html += `<td>${Math.round(st)}</td>`; // S/T column shows standard time
                        html += `<td>${rate.toFixed(0)}%</td>`; // Rate = (Adjusted/S/T)�100
                        html += `<td>${Math.round(adjusted)}</td>`; // Adjusted S/T
                        html += `<td>${efficiency.toFixed(1)}%</td>`; // Daily Efficiency
                        html += `<td>${woCount}</td>`; // WO Count
                    } else {
                        // Utilization Mode: WO Count, Work Time, Utilization
                        const rateClass = dateData.workRate >= 80 ? 'work-rate-high' :
                                        dateData.workRate >= 50 ? 'work-rate-normal' :
                                        dateData.workRate >= 30 ? 'work-rate-low' : 'work-rate-critical';
                        
                        html += `<td>${dateData.validCount}</td>`;
                        html += `<td>${Math.round(dateData.totalMinutes)}</td>`;
                        html += `<td class="${rateClass}">${dateData.workRate.toFixed(0)}%</td>`;
                    }
                } else {
                    const emptyCols = isEfficiency ? 5 : 3;
                    html += '<td>-</td>'.repeat(emptyCols);
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
            <strong class="text-purple-700">Work Efficiency Metric Explained (Shift Productivity):</strong><br>
            �� <strong>S/T(m)</strong>: Standard Time - the baseline time expected for the task<br>
            �� <strong>Rate(%)</strong>: Worker performance multiplier (portion of task completed by this worker)<br>
            �� <strong>Adjusted S/T(m)</strong>: Adjusted Standard Time = S/T � Rate ÷ 100<br>
            �� <strong>Efficiency(%)</strong>: Daily efficiency = (Adjusted S/T ÷ (Shift Count � 660 min)) � 100%<br>
            �� <strong>WO#</strong>: Number of work orders completed<br>
            �� <strong>� Icon</strong>: Outlier (Efficiency > ${AppState.outlierThreshold || 1000}%, excluded from charts/KPIs)<br>
            <br>
            <strong class="text-sm">� Note:</strong><br>
            <span class="text-xs">
            This table shows daily breakdown of work. Efficiency is calculated per date based on shifts worked that day.
            </span>
        `;
    } else {
        pivotGlossary.innerHTML = `
            <strong class="text-blue-700">Time Utilization Metric:</strong><br>
            �� <strong>WO Count</strong>: Number of valid work orders completed<br>
            �� <strong>Std Time(m)</strong>: Total work time after removing overlapping intervals<br>
            �� <strong>Work Rate</strong>: Utilization = Actual time ÷ Available shift time � 100%<br>
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
    let filteredOutliers = 0; //  NEW: Track outliers
    
    data.forEach(record => {
        totalRecords++;
        
        // Debug: Check first record's foDesc2
        if (totalRecords === 1) {
            console.log(' First record in aggregateByWorker:', {
                workerName: record.workerName,
                foDesc3: record.foDesc3,
                foDesc2: record.foDesc2,
                seq: record.seq
            });
        }
        
        // � Individual record outlier filtering removed - now done at aggregation level
        
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
                //  FIX: Initialize accumulation fields for Efficiency mode
                'Worker S/T': 0,  // Will accumulate S/T
                assignedStandardTime: 0,  // Will accumulate Adjusted S/T
                totalMinutesOriginal: 0  // Will accumulate Actual
            };
        }
        
        //  CHANGED: Result CNT와 무관�� �� ����� ��
        // ����� �� �� ���를 �산� ���
        if (record.workerActMins > 0) {
            aggregated[key].totalMinutes += record.workerActMins;
            aggregated[key].validCount += 1;
            validRecords++;
            
            //  Accumulate efficiency fields (S/T, Rate, Assigned, Actual)
            const st = record['Worker S/T'] || 0;
            const rate = record['Worker Rate(%)'] || 0;
            const assigned = (st * rate / 100);
            
            //  DEBUG: Log first few records to check S/T values
            if (totalRecords <= 3) {
                console.log(` Record ${totalRecords}: Worker="${record.workerName}", S/T=${st}, Rate=${rate}%, Assigned=${assigned.toFixed(1)}`, {
                    process: record.foDesc3,
                    date: record.workingDay,
                    resultCnt: record.resultCnt,
                    workerActMins: record.workerActMins,
                    availableFields: Object.keys(record).filter(k => k.includes('S/T') || k.includes('Rate'))
                });
            }
            
            aggregated[key]['Worker S/T'] += st;  // Accumulate S/T
            aggregated[key].assignedStandardTime += assigned;  // Accumulate Adjusted S/T
            aggregated[key].totalMinutesOriginal += record['Worker Act'] || 0;  // Accumulate Actual
        } else {
            invalidRecords++;  // No work time recorded
        }
    });
    
    console.log(` Aggregation summary: ${totalRecords} total, ${validRecords} valid, ${invalidRecords} invalid (outlier marking will be applied next)`);
    
    //  DEBUG: Check if assignedStandardTime is being accumulated
    const sampleAggregated = Object.values(aggregated).slice(0, 3);
    console.log(' Sample aggregated data (first 3):', sampleAggregated.map(item => ({
        worker: item.workerName,
        day: item.workingDay,
        process: item.foDesc3,
        'Worker S/T': item['Worker S/T'],
        'Adjusted S/T': item.assignedStandardTime,
        'Actual': item.totalMinutesOriginal,
        'Worker Rate(%)': item['Worker Rate(%)'],
        assignedStandardTime: item.assignedStandardTime,
        totalMinutesOriginal: item.totalMinutesOriginal,
        calculatedEfficiency: item.totalMinutesOriginal > 0 ? ((item.assignedStandardTime / item.totalMinutesOriginal) * 100).toFixed(1) + '%' : '0%'
    })));
    
    // Convert to array and calculate rates
    const result = Object.values(aggregated).map(item => {
        // Calculate Utilization Rate
        const utilizationRate = (item.totalMinutes / 660) * 100;
        
        // Calculate Efficiency Rate: assigned standard time / shift time � 100
        // Shift-based productivity measure
        const shiftTime = 660; // Standard shift time (11 hours)
        const efficiencyRate = (item.assignedStandardTime / shiftTime) * 100;
        
        //  Mark outliers for visual display (but don't filter them out)
        const outlierThreshold = AppState.outlierThreshold || 1000;
        const isOutlier = (AppState.currentMetricType === 'efficiency' && efficiencyRate > outlierThreshold);
        
        if (isOutlier) {
            console.warn(`� Outlier marked (>${outlierThreshold}%): ${item.workerName}, ${item.workingDay}, ${item.foDesc3}, Efficiency: ${efficiencyRate.toFixed(1)}%`);
        }
        
        return {
            ...item,
            utilizationRate: utilizationRate,
            utilizationBand: getUtilizationBand(utilizationRate),
            efficiencyRate: efficiencyRate,
            efficiencyBand: getEfficiencyBand(efficiencyRate),
            isOutlier: isOutlier, //  Flag for visual styling in table
            // Legacy fields
            workRate: utilizationRate,
            performanceBand: getPerformanceBand(utilizationRate)
        };
    });
    
    // Count outliers for logging
    const outlierCount = result.filter(r => r.isOutlier).length;
    if (outlierCount > 0) {
        console.log(` Outlier marking complete: ${outlierCount} records marked (will be shown in gray with � icon)`);
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
    if (rate >= 100) return { label: 'Excellent', color: 'green', bgColor: '#dcfce7', textColor: '#166534' };
    if (rate >= 80) return { label: 'Normal', color: 'gray', bgColor: '#f3f4f6', textColor: '#374151' };
    if (rate >= 60) return { label: 'Poor', color: 'orange', bgColor: '#fed7aa', textColor: '#c2410c' };
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
    
    // Total Workers
    const totalWorkers = new Set(workerAgg.map(w => w.workerName)).size;
    
    // Update labels and calculate values based on metric type
    const secondLabel = document.getElementById('kpiSecondLabel');
    const thirdLabel = document.getElementById('kpiThirdLabel');
    const avgRateLabel = document.getElementById('kpiAvgRateLabel');
    const avgRateCard = document.getElementById('kpiAvgRateCard');
    
    let secondValue, thirdValue, avgRate;
    
    if (isEfficiency) {
        //  Efficiency Mode
        // Card 2: Total Adjusted S/T (Total Assigned Time)
        secondLabel.textContent = 'Total Adjusted S/T (min)';
        secondValue = workerAgg.reduce((sum, w) => sum + (w.assignedStandardTime || 0), 0);
        
        // Card 3: Total Shift Time (total shifts � 660 min)
        thirdLabel.textContent = 'Total Shift Time (min)';
        const totalShifts = workerAgg.reduce((sum, w) => sum + (w.shiftCount || 0), 0);
        thirdValue = totalShifts * 660; // Each shift = 11 hours = 660 minutes
        
        // Card 4: Average Efficiency Rate = (Total Adjusted S/T / Total Shift Time) � 100
        avgRateLabel.textContent = 'Avg Efficiency Rate (Shift Productivity)';
        avgRate = thirdValue > 0 ? (secondValue / thirdValue) * 100 : 0;
        
        // Purple theme
        avgRateCard.style.background = 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)';
        avgRateCard.style.border = '2px solid #9333ea';
        avgRateCard.style.boxShadow = '0 4px 6px -1px rgba(147, 51, 234, 0.1), 0 2px 4px -1px rgba(147, 51, 234, 0.06)';
        avgRateLabel.style.color = '#7e22ce';
        
    } else {
        // � Utilization Mode
        // Card 2: Total Shift Time (total shifts � 660 min)
        secondLabel.textContent = 'Total Shift Time (min)';
        //  CORRECTED: Sum of all actual shifts worked by all workers
        const totalShifts = workerAgg.reduce((sum, w) => sum + (w.shiftCount || 0), 0);
        secondValue = totalShifts * 660; // Each shift = 11 hours = 660 minutes
        
        // Card 3: Total Work Time (sum of actual work time after deduplication)
        thirdLabel.textContent = 'Total Work Time (min)';
        thirdValue = workerAgg.reduce((sum, w) => sum + (w.totalMinutes || 0), 0);
        
        // Card 4: Average Utilization Rate = (Total Work Time / Total Shift Time) � 100
        avgRateLabel.textContent = 'Average Utilization Rate';
        avgRate = secondValue > 0 ? (thirdValue / secondValue) * 100 : 0;
        
        // Blue theme
        avgRateCard.style.background = 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)';
        avgRateCard.style.border = '2px solid #0284c7';
        avgRateCard.style.boxShadow = '0 4px 6px -1px rgba(2, 132, 199, 0.1), 0 2px 4px -1px rgba(2, 132, 199, 0.06)';
        avgRateLabel.style.color = '#0369a1';
    }
    
    console.log(` KPI Calculation:
    - Metric: ${isEfficiency ? 'Efficiency' : 'Utilization'}
    - Total Workers: ${totalWorkers}
    ${!isEfficiency ? `- Total Shifts: ${workerAgg.reduce((sum, w) => sum + (w.shiftCount || 0), 0)}` : ''}
    - Card 2 (${secondLabel.textContent}): ${secondValue.toFixed(0)}
    - Card 3 (${thirdLabel.textContent}): ${thirdValue.toFixed(0)}
    - Average Rate Calculation: (${secondValue.toFixed(0)} / ${thirdValue.toFixed(0)}) � 100 = ${avgRate.toFixed(2)}%
    `);
    
    // Update display
    document.getElementById('kpiWorkers').textContent = totalWorkers.toLocaleString();
    document.getElementById('kpiSecondValue').textContent = Math.round(secondValue).toLocaleString();
    document.getElementById('kpiThirdValue').textContent = Math.round(thirdValue).toLocaleString();
    document.getElementById('kpiAvgWorkRate').textContent = avgRate.toFixed(1) + '%';
    
    // Draw Report KPI sparklines
    drawReportKpiSparklines(workerAgg, isEfficiency);
    
    // Show/hide Outlier Threshold control based on metric type
    const outlierControl = document.getElementById('outlierThresholdControl');
    if (outlierControl) {
        outlierControl.style.display = isEfficiency ? 'block' : 'none';
    }
    
    // � v3.4.0: Show/hide info icon and shift filter warning based on Working Shift filter
    const infoIcon = document.getElementById('kpiWorkersInfoIcon');
    const shiftWarning = document.getElementById('shiftFilterWarning');
    const currentShift = AppState.filters.workingShift;
    
    if (infoIcon && shiftWarning) {
        // Show info icon only when "All" shifts are selected (or empty/default)
        if (currentShift === 'All' || currentShift === '') {
            infoIcon.classList.remove('hidden');
            shiftWarning.classList.add('hidden');
        } else {
            // Hide info icon and show warning for Day/Night filters
            infoIcon.classList.add('hidden');
            shiftWarning.classList.remove('hidden');
        }
    }
}

function drawReportKpiSparklines(workerAgg, isEfficiency) {
  // Group by date
  const dateGroups = {};
  workerAgg.forEach(w => {
    const date = w.workingDay;
    if (!dateGroups[date]) {
      dateGroups[date] = { 
        totalShiftTime: 0, 
        totalWorkTime: 0, 
        totalAssignedST: 0 
      };
    }
    const shiftTime = (w.shiftCount || 0) * 660;
    dateGroups[date].totalShiftTime += shiftTime;
    dateGroups[date].totalWorkTime += w.totalMinutes || 0;
    dateGroups[date].totalAssignedST += w.assignedStandardTime || 0;
  });
  
  // Get last 7 dates
  const dates = Object.keys(dateGroups).sort().slice(-7);
  
  // Calculate rate data only (for the 4th card)
  const rateData = [];
  
  dates.forEach(date => {
    const g = dateGroups[date];
    
    if (isEfficiency) {
      const rate = g.totalShiftTime > 0 ? (g.totalAssignedST / g.totalShiftTime) * 100 : 0;
      rateData.push(rate);
    } else {
      const rate = g.totalShiftTime > 0 ? (g.totalWorkTime / g.totalShiftTime) * 100 : 0;
      rateData.push(rate);
    }
  });
  
  // Pad if less than 7 days
  while (rateData.length < 7) {
    rateData.unshift(rateData[0] || 0);
  }
  
  // Draw sparkline only for the 4th card (Rate)
  drawMiniSparkline('sparkKpiRate', rateData, isEfficiency ? '#9333ea' : '#0284c7');
}

function drawMiniSparkline(canvasId, data, color) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  // Destroy existing chart
  if (DashboardState.charts[canvasId]) {
    DashboardState.charts[canvasId].destroy();
  }
  
  try {
    DashboardState.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['', '', '', '', '', '', ''],
        datasets: [{
          data: data,
          borderColor: color,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false }, 
          tooltip: { enabled: false } 
        },
        scales: {
          x: { display: false },
          y: { display: false, beginAtZero: true }
        }
      }
    });
  } catch (error) {
    console.error(`Error creating sparkline ${canvasId}:`, error);
  }
}

// Calculate and display Week-over-Week (WoW) changes
function calculateAndDisplayWoW(currentWorkerAgg, currentWorkers, currentSecond, currentThird, currentRate) {
    const aggregated = AppState.aggregatedData || [];
    
    if (aggregated.length === 0) {
        // No data, show '-'
        document.getElementById('kpiWorkersWoW').textContent = '-';
        document.getElementById('kpiSecondWoW').textContent = '-';
        document.getElementById('kpiThirdWoW').textContent = '-';
        document.getElementById('kpiAvgRateWoW').textContent = '-';
        return;
    }
    
    // Get all unique dates and sort
    const dates = [...new Set(aggregated.map(r => r.workingDay))].sort();
    
    if (dates.length < 2) {
        // Not enough historical data
        document.getElementById('kpiWorkersWoW').textContent = '-';
        document.getElementById('kpiSecondWoW').textContent = '-';
        document.getElementById('kpiThirdWoW').textContent = '-';
        document.getElementById('kpiAvgRateWoW').textContent = '-';
        return;
    }
    
    // Get latest date and 7 days ago
    const latestDate = dates[dates.length - 1];
    const latestDateObj = new Date(latestDate);
    const sevenDaysAgo = new Date(latestDateObj);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
    
    // Filter data for 7 days ago
    const previousData = aggregated.filter(r => r.workingDay === sevenDaysAgoStr);
    
    if (previousData.length === 0) {
        // No data for 7 days ago
        document.getElementById('kpiWorkersWoW').textContent = 'No data 7d ago';
        document.getElementById('kpiSecondWoW').textContent = 'No data 7d ago';
        document.getElementById('kpiThirdWoW').textContent = 'No data 7d ago';
        document.getElementById('kpiAvgRateWoW').textContent = 'No data 7d ago';
        return;
    }
    
    // Calculate previous week's metrics
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    const prevWorkers = new Set(previousData.map(r => r.workerName)).size;
    
    let prevSecond, prevThird, prevRate;
    
    if (isEfficiency) {
        prevSecond = previousData.reduce((sum, r) => sum + (r.totalStandardTime || 0), 0);
        const prevShifts = previousData.reduce((sum, r) => sum + (r.shiftCount || 0), 0);
        prevThird = prevShifts * 660;
        prevRate = prevThird > 0 ? (prevSecond / prevThird) * 100 : 0;
    } else {
        const prevShifts = previousData.reduce((sum, r) => sum + (r.shiftCount || 0), 0);
        prevSecond = prevShifts * 660;
        prevThird = previousData.reduce((sum, r) => sum + (r.totalActualMins || 0), 0);
        prevRate = prevSecond > 0 ? (prevThird / prevSecond) * 100 : 0;
    }
    
    // Calculate WoW percentages
    const workersWoW = prevWorkers > 0 ? ((currentWorkers - prevWorkers) / prevWorkers) * 100 : 0;
    const secondWoW = prevSecond > 0 ? ((currentSecond - prevSecond) / prevSecond) * 100 : 0;
    const thirdWoW = prevThird > 0 ? ((currentThird - prevThird) / prevThird) * 100 : 0;
    const rateWoW = prevRate > 0 ? ((currentRate - prevRate) / prevRate) * 100 : 0;
    
    // Format and display with colors
    const formatWoW = (value) => {
        const sign = value >= 0 ? '+' : '';
        const color = value >= 0 ? 'text-green-600' : 'text-red-600';
        const icon = value >= 0 ? '▲' : '▼';
        return `<span class="${color}">${icon} ${sign}${value.toFixed(1)}% vs 7d ago</span>`;
    };
    
    document.getElementById('kpiWorkersWoW').innerHTML = formatWoW(workersWoW);
    document.getElementById('kpiSecondWoW').innerHTML = formatWoW(secondWoW);
    document.getElementById('kpiThirdWoW').innerHTML = formatWoW(thirdWoW);
    document.getElementById('kpiAvgRateWoW').innerHTML = formatWoW(rateWoW);
}

// Update performance bands
function updatePerformanceBands(workerAgg) {
    // Determine which metric to use
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    
    console.log(` updatePerformanceBands - Mode: ${isEfficiency ? 'Efficiency' : 'Utilization'}, Workers: ${workerAgg.length}`);
    
    //  DEBUG: Check for duplicate workers
    const workerNames = workerAgg.map(w => w.workerName);
    const uniqueWorkers = new Set(workerNames);
    console.log(` WORKER COUNT DEBUG:
    - Total records in workerAgg: ${workerAgg.length}
    - Unique worker names: ${uniqueWorkers.size}
    - Duplicate entries: ${workerAgg.length - uniqueWorkers.size}
    `);
    
    // Check if there are workers appearing on both Day and Night
    const shiftData = {};
    workerAgg.forEach(w => {
        if (!shiftData[w.workerName]) {
            shiftData[w.workerName] = new Set();
        }
        // Extract shifts from worker data
        if (w.shifts) {
            w.shifts.forEach(shift => shiftData[w.workerName].add(shift));
        }
    });
    
    const multiShiftWorkers = Object.entries(shiftData)
        .filter(([name, shifts]) => shifts.size > 1)
        .slice(0, 5);
    
    if (multiShiftWorkers.length > 0) {
        console.log(` Sample workers with multiple shifts:`, multiShiftWorkers.map(([name, shifts]) => ({
            name,
            shifts: Array.from(shifts)
        })));
    }
    
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
        console.log(' Sample workers:', samples);
        console.table(samples);
    }
    
    // Update band titles based on current metric
    const excellentTitle = document.getElementById('excellentTitle');
    const normalTitle = document.getElementById('normalTitle');
    const poorTitle = document.getElementById('poorTitle');
    const criticalTitle = document.getElementById('criticalTitle');
    
    if (isEfficiency) {
        // Work Efficiency bands
        excellentTitle.innerHTML = '<i class="fas fa-trophy mr-2"></i>Excellent (≥100%)';
        normalTitle.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Normal (80-100%)';
        poorTitle.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Poor (60-80%)';
        criticalTitle.innerHTML = '<i class="fas fa-times-circle mr-2"></i>At-Risk (<60%)';
    } else {
        // Time Utilization bands
        excellentTitle.innerHTML = '<i class="fas fa-trophy mr-2"></i>Excellent (≥80%)';
        normalTitle.innerHTML = '<i class="fas fa-check-circle mr-2"></i>Normal (50-80%)';
        poorTitle.innerHTML = '<i class="fas fa-exclamation-triangle mr-2"></i>Poor (30-50%)';
        criticalTitle.innerHTML = '<i class="fas fa-times-circle mr-2"></i>At-Risk (<30%)';
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
    
    console.log(` Band distribution: Excellent=${excellent.length}, Normal=${normal.length}, Poor=${poor.length}, Critical=${critical.length}`);
    
    // Get rate value based on current metric
    const getRate = (w) => isEfficiency ? w.efficiencyRate : w.utilizationRate;
    
    // Excellent workers
    const excellentDiv = document.getElementById('excellentWorkers');
    if (excellent.length > 0) {
        excellentDiv.innerHTML = '<div class="space-y-2">' + excellent.map(w => 
            `<div class="flex flex-col p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
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
    
    // Normal workers -  FIX: Use blue color consistently
    const normalDiv = document.getElementById('normalWorkers');
    if (normal.length > 0) {
        normalDiv.innerHTML = '<div class="space-y-2">' + normal.map(w => 
            `<div class="flex flex-col p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
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
            `<div class="flex flex-col p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
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
            `<div class="flex flex-col p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all cursor-pointer" onclick="showWorkerDetail('${w.workerName.replace(/'/g, "\\'")}')">
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
    console.log(' Sample process data:');
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
    
    console.log(' Process chart order:', sortedProcesses.map(p => `${p.name} [${p.foDesc2}] (Cat: ${p.categorySeq}, Seq: ${p.seq}, WorkRate: ${p.avgWorkRate}%)`).join(', '));
    console.log(' Top 3 processes:', sortedProcesses.slice(0, 3).map(p => ({
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
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    
    const bandCounts = {
        'Excellent': 0,
        'Normal': 0,
        'Poor': 0,
        'Critical': 0
    };
    
    // Count workers by band based on current metric
    workerAgg.forEach(item => {
        const band = isEfficiency ? item.efficiencyBand : item.utilizationBand;
        if (band && band.label) {
            bandCounts[band.label]++;
        }
    });
    
    console.log(`� Donut chart band counts: Excellent=${bandCounts['Excellent']}, Normal=${bandCounts['Normal']}, Poor=${bandCounts['Poor']}, Critical=${bandCounts['Critical']}`);
    
    const ctx = document.getElementById('performanceChart');
    
    if (AppState.charts.performance) {
        AppState.charts.performance.destroy();
    }
    
    // Dynamic labels based on metric type
    const labels = isEfficiency
        ? ['Excellent (��100%)', 'Normal (80-<100%)', 'Poor (60-<80%)', 'At-Risk (<60%)']
        : ['Excellent (��80%)', 'Normal (50-<80%)', 'Poor (30-<50%)', 'At-Risk (<30%)'];
    
    console.log(`� Donut chart updating: Metric=${AppState.currentMetricType}, Labels=${JSON.stringify(labels)}`);
    
    AppState.charts.performance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
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
    
    //  FIX: Update entire table header with sortable columns
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
                Adjusted S/T (min) <i class="fas fa-sort text-xs ml-1"></i>
            </th>
            <th class="cursor-pointer hover:bg-gray-100" onclick="sortDataTable('efficiencyRate')">
                Efficiency (%) <i class="fas fa-sort text-xs ml-1"></i>
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
        const colSpan = isEfficiency ? 10 : 9;
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
        
        //  Visual styling for outliers
        const outlierThreshold = AppState.outlierThreshold || 1000;
        const isOutlier = item.isOutlier || false;
        const rowClass = isOutlier ? 'class="outlier-row"' : '';
        const outlierIcon = isOutlier ? `<i class="fas fa-ban text-red-500 mr-1" title="Filtered out: Efficiency ${rate?.toFixed(1)}% (>${outlierThreshold}%)"></i>` : '';
        
        if (isEfficiency) {
            // Efficiency mode: show S/T, Rate, Adjusted S/T, Efficiency (%)
            const st = item['Worker S/T'] || 0;
            const workerRate = item['Worker Rate(%)'] || 0;
            const assigned = item.assignedStandardTime || 0;
            
            // Calculate daily efficiency: Adjusted S/T ÷ (Shift Count � 660) � 100
            const shiftCount = item.shifts?.size || 1;
            const shiftTime = shiftCount * 660;
            const efficiency = shiftTime > 0 ? (assigned / shiftTime) * 100 : 0;
            
            return `
                <tr ${rowClass}>
                    <td>${outlierIcon}${item.workerName}</td>
                    <td>${item.foDesc3}</td>
                    <td>${item.workingDay}</td>
                    <td><strong>${actualShiftText}</strong></td>
                    <td>${shiftText}</td>
                    <td>${st.toFixed(1)}</td>
                    <td>${workerRate.toFixed(0)}</td>
                    <td>${assigned.toFixed(0)}</td>
                    <td><strong>${efficiency.toFixed(1)}%</strong></td>
                    <td><span class="worker-badge ${bandClass}">${bandText}</span></td>
                </tr>
            `;
        } else {
            // Utilization mode: show Work Time, Work Count, Utilization Rate
            return `
                <tr ${rowClass}>
                    <td>${outlierIcon}${item.workerName}</td>
                    <td>${item.foDesc3}</td>
                    <td>${item.workingDay}</td>
                    <td><strong>${actualShiftText}</strong></td>
                    <td>${shiftText}</td>
                    <td>${Math.round(item.totalMinutes)}</td>
                    <td>${item.validCount}</td>
                    <td><strong>${rate?.toFixed(1) || '0.0'}%</strong></td>
                    <td><span class="worker-badge ${bandClass}">${bandText}</span></td>
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
        { fdDesc: 'QC Pre-assembly Inspection', foDesc2: 'IM QC', foDesc3: 'QC Pre-assembly Inspection', seq: 1 },
        { fdDesc: 'Assembly Inspection', foDesc2: 'IM QC', foDesc3: 'Assembly Inspection', seq: 2 },
        { fdDesc: 'Final IM Inspection', foDesc2: 'IM QC', foDesc3: 'Final IM Inspection', seq: 3 },
        
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
    console.log(` ${AppState.processMapping.length} process mappings loaded`);
    updateMappingTable();
}

// Add new mapping
function addMapping() {
    const fdDesc = document.getElementById('newFDDesc').value.trim();
    const foDesc2 = document.getElementById('newFODesc2').value.trim();
    const foDesc3 = document.getElementById('newFODesc3').value.trim();
    const seq = parseInt(document.getElementById('newSeq').value) || 999;
    
    if (!fdDesc || !foDesc3) {
        alert('FD Desc와 FO Desc 3� �� �� ��목���.');
        return;
    }
    
    // Check duplicate
    const exists = AppState.processMapping.some(m => 
        normalizeHeader(m.fdDesc) === normalizeHeader(fdDesc)
    );
    
    if (exists) {
        if (!confirm('�� �재�� �����. �어������?')) {
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
    if (!confirm('� ��� 삭�������?')) {
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
        // Show loading overlay
        showLoadingOverlay('Starting upload...');
        
        // Disable button and show loading
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Starting...';
        saveStatus.classList.add('hidden');
        
        console.log('� Saving data to database...');
        
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
            console.log(' Upload started in background!', result);
            
            // Hide loading overlay
            hideLoadingOverlay();
            
            // Show simple success message
            showSuccessMessage('Data uploaded successfully! Processing in background...');
            
            // Refresh uploads list after 3 seconds
            setTimeout(() => {
                loadUploadsList();
            }, 3000);
            
            // Re-enable button
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save to Database';
            
        } else {
            throw new Error(result.error || 'Failed to start upload');
        }
        
    } catch (error) {
        console.error(' Failed to save to database:', error);
        hideLoadingOverlay();
        alert('Failed to save to database:\n' + error.message);
        
        // Reset button
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save to Database';
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
        
        console.log(` Loaded ${result.uploads.length} uploads`);
        
    } catch (error) {
        console.error(' Failed to load uploads list:', error);
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
        console.log(`  Deleting upload #${uploadId}...`);
        
        const response = await fetch(`/api/uploads/${uploadId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            console.log(` Upload #${uploadId} deleted successfully`);
            
            // Refresh uploads list
            loadUploadsList();
            
            // Show success message
            alert(`Upload deleted successfully!\n\n${result.message}`);
        } else {
            throw new Error(result.error || 'Delete failed');
        }
    } catch (error) {
        console.error(` Failed to delete upload #${uploadId}:`, error);
        alert('Failed to delete upload:\n' + error.message);
    }
}

// Load specific upload by ID
async function loadUploadById(uploadId) {
    try {
        console.log(`� Loading upload #${uploadId}...`);
        showUploadStatus(true);
        updateProgress(20);
        showLoadingOverlay('Loading data from database...');
        
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
        
        updateProgress(70);
        
        // Load raw data with pagination
        console.log(' Loading raw data in batches...');
        const allRawData = [];
        let page = 1;
        let hasMore = true;
        const limit = 1000; // � �� 1000��
        
        while (hasMore) {
            const rawDataResponse = await fetch(`/api/uploads/${uploadId}/raw-data?page=${page}&limit=${limit}`);
            if (!rawDataResponse.ok) {
                console.warn(` Failed to load page ${page}, stopping pagination`);
                break;
            }
            
            const rawDataResult = await rawDataResponse.json();
            if (rawDataResult.success && rawDataResult.rawData) {
                allRawData.push(...rawDataResult.rawData);
                console.log(` Loaded page ${page}/${rawDataResult.pagination.totalPages} (${allRawData.length}/${rawDataResult.pagination.total} records)`);
                
                hasMore = rawDataResult.pagination.hasMore;
                page++;
                
                // Update progress bar
                const progress = 70 + Math.floor((allRawData.length / rawDataResult.pagination.total) * 20);
                updateProgress(progress);
            } else {
                hasMore = false;
            }
        }
        
        console.log(` All raw data loaded: ${allRawData.length} records`);
        updateProgress(90);
        
        // Restore data to AppState - convert DB format to app format
        AppState.rawData = allRawData.map(d => ({
            workerName: d.worker_name,
            foDesc: d.fo_desc,
            fdDesc: d.fd_desc,
            startDatetime: d.start_datetime,
            endDatetime: d.end_datetime,
            workerAct: d.worker_act,
            workerActMins: d.worker_act,  // Add this field for consistency
            'Worker Act': d.worker_act,   //  Add Worker Act field
            'Worker S/T': d.worker_st || 0,  //  Restore Worker S/T
            'Worker Rate(%)': d.worker_rate_pct || 0,  //  Restore Worker Rate(%)
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
        
        // Load process mapping from DB or use default hardcoded mappings
        if (!dataResult.processMapping || dataResult.processMapping.length === 0) {
            // No mappings in DB, use default hardcoded mappings
            console.log('� No process mappings in database. Using DEFAULT_PROCESS_MAPPING.');
            AppState.processMapping = [];
            Object.keys(DEFAULT_PROCESS_MAPPING).forEach(fdDesc => {
                const mapping = DEFAULT_PROCESS_MAPPING[fdDesc];
                AppState.processMapping.push({
                    fdDesc: fdDesc,
                    foDesc2: mapping.foDesc2,
                    foDesc3: mapping.foDesc3,
                    seq: mapping.seq || 999
                });
            });
            console.log(` Loaded ${AppState.processMapping.length} default process mappings`);
        } else {
            console.log(` Loaded ${AppState.processMapping.length} process mappings from database`);
        }
        
        // Load shift calendar from DB, or use default if not available
        const dbShiftCalendar = (dataResult.shiftCalendar || []).map(s => ({
            date: s.date,
            dayShift: s.day_shift,
            nightShift: s.night_shift
        }));
        
        if (dbShiftCalendar.length > 0) {
            AppState.shiftCalendar = dbShiftCalendar;
            console.log(` Loaded ${dbShiftCalendar.length} shift calendar entries from DB`);
        } else {
            // Use default hardcoded shift calendar if DB doesn't have one
            loadDefaultShiftCalendar();
            console.log(` Using default hardcoded shift calendar (${AppState.shiftCalendar.length} entries)`);
        }
        
        // Convert datetime strings back to Date objects for rawData
        AppState.rawData = AppState.rawData.map(d => ({
            ...d,
            startDatetime: d.startDatetime ? new Date(d.startDatetime) : null,
            endDatetime: d.endDatetime ? new Date(d.endDatetime) : null
        }));
        
        //  DEBUG: Check if Worker S/T and Worker Rate(%) are loaded from DB
        console.log(' DEBUG: First 3 rawData records after DB load:');
        AppState.rawData.slice(0, 3).forEach((r, idx) => {
            console.log(`  [${idx+1}] Worker: ${r.workerName}`);
            console.log(`      Worker S/T: ${r['Worker S/T']}, Worker Rate(%): ${r['Worker Rate(%)']}, Worker Act: ${r['Worker Act']}`);
        });
        
        // Re-process the data with current mappings (async chunks for large datasets)
        console.log(' Re-processing data with mappings...');
        
        // DEBUG: Check rawData date range
        const rawDates = [...new Set(AppState.rawData.map(d => d.workingDay).filter(Boolean))].sort();
        console.log(`📅 DEBUG: rawData date range: ${rawDates[0]} to ${rawDates[rawDates.length - 1]} (${rawDates.length} unique dates)`);
        
        // For large datasets, process in chunks to avoid blocking UI
        if (AppState.rawData.length > 5000) {
            console.log(`🔄 Large dataset detected (${AppState.rawData.length} records) - processing in chunks...`);
            AppState.processedData = await processDataInChunks(AppState.rawData);
        } else {
            AppState.processedData = processData(AppState.rawData);
        }
        
        // DEBUG: Check processedData date range
        const processedDates = [...new Set(AppState.processedData.map(d => d.workingDay).filter(Boolean))].sort();
        console.log(`📅 DEBUG: processedData date range: ${processedDates[0]} to ${processedDates[processedDates.length - 1]} (${processedDates.length} unique dates)`);
        
        // Aggregate data for dashboard (SAME ORDER AS EXCEL UPLOAD)
        console.log(`🔄 Aggregating ${AppState.processedData.length} processed records for dashboard...`);
        AppState.aggregatedData = aggregateDataForDashboard(AppState.processedData);
        console.log(`✅ Dashboard aggregation complete: ${AppState.aggregatedData ? AppState.aggregatedData.length : 0} entries`);
        
        // DEBUG: Check date range in aggregatedData
        if (AppState.aggregatedData && AppState.aggregatedData.length > 0) {
            const dates = [...new Set(AppState.aggregatedData.map(d => d.workingDay))].sort();
            console.log(`📅 Date range in aggregatedData: ${dates[0]} to ${dates[dates.length - 1]} (${dates.length} unique dates)`);
            console.log(`📊 Sample aggregatedData:`, AppState.aggregatedData.slice(0, 3));
        }
        
        updateProgress(100);
        
        // Update UI asynchronously to avoid blocking
        await new Promise(resolve => setTimeout(resolve, 100)); // Allow UI to update
        
        updateMappingTable();
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Allow UI to update
        
        showUploadResult(AppState.processedData);
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Allow UI to update
        
        updateReport();
        
        // Refresh Executive Dashboard if data exists (SAME AS EXCEL UPLOAD)
        if (typeof refreshExecutiveDashboard === 'function' && AppState.processedData && AppState.processedData.length > 0) {
            setTimeout(() => {
                refreshExecutiveDashboard();
                if (typeof initExecutiveDashboard === 'function') {
                    initExecutiveDashboard();
                }
            }, 500);
        }
        
        // Switch to Dashboard tab (user wants to see dashboard after load)
        setTimeout(() => {
            switchTab('dashboard');
        }, 600);
        
        console.log(' Data loaded successfully!');
        console.log(` Loaded ${AppState.processedData.length} records from upload #${uploadId}`);
        console.log(` Upload: ${dataResult.upload.filename}`);
        
        setTimeout(() => {
            showUploadStatus(false);
            hideLoadingOverlay();
        }, 500);
        
    } catch (error) {
        console.error(' Failed to load upload:', error);
        alert('Failed to load upload:\n' + error.message);
        showUploadStatus(false);
        hideLoadingOverlay();
    }
}

// Load last upload from database
async function loadLastUpload() {
    try {
        console.log('� Loading last upload from database...');
        showUploadStatus(true);
        updateProgress(20);
        showLoadingOverlay('Loading last upload...');
        
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
        console.log(' Last upload:', lastUpload);
        
        updateProgress(60);
        
        // Fetch full data for this upload
        const dataResponse = await fetch(`/api/uploads/${lastUpload.id}`);
        if (!dataResponse.ok) {
            throw new Error(`Failed to fetch upload data: ${dataResponse.status}`);
        }
        
        updateProgress(70);
        const dataResult = await dataResponse.json();
        
        if (!dataResult.success) {
            throw new Error('Failed to load upload data');
        }
        
        // Load raw data with pagination
        console.log(' Loading raw data in batches...');
        const allRawData = [];
        let page = 1;
        let hasMore = true;
        const limit = 1000; // � �� 1000��
        
        while (hasMore) {
            const rawDataResponse = await fetch(`/api/uploads/${lastUpload.id}/raw-data?page=${page}&limit=${limit}`);
            if (!rawDataResponse.ok) {
                console.warn(` Failed to load page ${page}, stopping pagination`);
                break;
            }
            
            const rawDataResult = await rawDataResponse.json();
            if (rawDataResult.success && rawDataResult.rawData) {
                allRawData.push(...rawDataResult.rawData);
                console.log(` Loaded page ${page}/${rawDataResult.pagination.totalPages} (${allRawData.length}/${rawDataResult.pagination.total} records)`);
                
                hasMore = rawDataResult.pagination.hasMore;
                page++;
                
                // Update progress bar
                const progress = 70 + Math.floor((allRawData.length / rawDataResult.pagination.total) * 20);
                updateProgress(progress);
            } else {
                hasMore = false;
            }
        }
        
        console.log(` All raw data loaded: ${allRawData.length} records`);
        updateProgress(90);
        
        // Restore data to AppState - convert DB format to app format
        AppState.rawData = allRawData.map(d => ({
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
        
        // Load process mapping from DB or use default hardcoded mappings
        if (!dataResult.processMapping || dataResult.processMapping.length === 0) {
            // No mappings in DB, use default hardcoded mappings
            console.log('� No process mappings in database. Using DEFAULT_PROCESS_MAPPING.');
            AppState.processMapping = [];
            Object.keys(DEFAULT_PROCESS_MAPPING).forEach(fdDesc => {
                const mapping = DEFAULT_PROCESS_MAPPING[fdDesc];
                AppState.processMapping.push({
                    fdDesc: fdDesc,
                    foDesc2: mapping.foDesc2,
                    foDesc3: mapping.foDesc3,
                    seq: mapping.seq || 999
                });
            });
            console.log(` Loaded ${AppState.processMapping.length} default process mappings`);
        } else {
            console.log(` Loaded ${AppState.processMapping.length} process mappings from database`);
        }
        
        // Load shift calendar from DB, or use default if not available
        const dbShiftCalendar2 = (dataResult.shiftCalendar || []).map(s => ({
            date: s.date,
            dayShift: s.day_shift,
            nightShift: s.night_shift
        }));
        
        if (dbShiftCalendar2.length > 0) {
            AppState.shiftCalendar = dbShiftCalendar2;
            console.log(` Loaded ${dbShiftCalendar2.length} shift calendar entries from DB`);
        } else {
            // Use default hardcoded shift calendar if DB doesn't have one
            loadDefaultShiftCalendar();
            console.log(` Using default hardcoded shift calendar (${AppState.shiftCalendar.length} entries)`);
        }
        
        // Convert datetime strings back to Date objects for rawData
        AppState.rawData = AppState.rawData.map(d => ({
            ...d,
            startDatetime: d.startDatetime ? new Date(d.startDatetime) : null,
            endDatetime: d.endDatetime ? new Date(d.endDatetime) : null
        }));
        
        // Re-process the data with current mappings
        console.log(' Re-processing data with mappings...');
        AppState.processedData = processData(AppState.rawData);
        
        // Aggregate data for dashboard (CRITICAL: needed for dashboard charts)
        AppState.aggregatedData = aggregateDataForDashboard(AppState.processedData);
        console.log(` Aggregated ${AppState.aggregatedData ? AppState.aggregatedData.length : 0} entries for dashboard`);
        
        updateProgress(100);
        
        // Update UI
        updateMappingTable();
        showUploadResult(AppState.processedData);
        updateReport();
        
        // Refresh Executive Dashboard if data exists
        if (typeof refreshExecutiveDashboard === 'function' && AppState.processedData && AppState.processedData.length > 0) {
            console.log('📊 Refreshing Dashboard after DB load...');
            setTimeout(() => {
                refreshExecutiveDashboard();
                if (typeof initExecutiveDashboard === 'function') {
                    initExecutiveDashboard();
                }
            }, 500);
        }
        
        console.log(' Data loaded successfully!');
        console.log(` Loaded ${AppState.processedData.length} records from upload #${lastUpload.id}`);
        console.log(` Upload date: ${lastUpload.upload_date}`);
        console.log(`� Filename: ${lastUpload.filename}`);
        
        setTimeout(() => {
            showUploadStatus(false);
            hideLoadingOverlay();
        }, 1000);
        
    } catch (error) {
        console.error(' Failed to load from database:', error);
        alert('Failed to load last upload:\n' + error.message);
        showUploadStatus(false);
        hideLoadingOverlay();
    }
}

// Sort Performance Bands
function sortPerformanceBand(bandType, order) {
    //  FIX: Use cached workerSummary instead of re-aggregating
    const aggregatedData = AppState.workerSummary || [];
    
    if (aggregatedData.length === 0) {
        console.warn(' No worker summary data available for sorting');
        return;
    }
    
    // Determine which metric to use for sorting
    const isEfficiency = AppState.currentMetricType === 'efficiency';
    const sortKey = isEfficiency ? 'efficiencyRate' : 'utilizationRate';
    
    console.log(` Sorting ${bandType} band by ${sortKey} (${order})`);
    
    //  FIX: Filter by correct band based on current metric
    let workers;
    const targetBand = bandType.charAt(0).toUpperCase() + bandType.slice(1);
    if (isEfficiency) {
        workers = aggregatedData.filter(w => w.efficiencyBand?.label === targetBand);
    } else {
        workers = aggregatedData.filter(w => w.utilizationBand?.label === targetBand);
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
    
    console.log(` Rendering ${workers.length} workers for ${bandType} band`);
    
    const div = document.getElementById(divId);
    if (workers.length > 0) {
        div.innerHTML = '<div class="space-y-2">' + workers.map(w => {
            //  FIX: Use the correct rate based on current metric type
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
                <th class="text-right p-2 font-semibold text-gray-700">Worker Rate<br><span class="text-xs font-normal text-gray-500">(%)</span></th>
                <th class="text-right p-2 font-semibold text-gray-700">Adjusted S/T<br><span class="text-xs font-normal text-gray-500">(min)</span></th>
                <th class="text-right p-2 font-semibold text-gray-700">Actual<br><span class="text-xs font-normal text-gray-500">(min)</span></th>
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
    
    // Get raw individual records for table display
    const rawDataSource = AppState.filteredData || AppState.processedData;
    const rawRecords = rawDataSource.filter(r => r.workerName === workerName && !r.rework);
    
    //  FIX: Aggregate rawRecords directly to match current filter state
    // Don't use cachedWorkerAgg because it may be out of sync with filters
    const aggregatedRecords = aggregateByWorker(rawRecords);
    
    let dataForSummary, dataForTable;
    
    if (isEfficiency) {
        // Efficiency: Use ALL aggregated data for KPI (including outliers)
        // Outliers are real work and should be included in calculations
        dataForSummary = aggregatedRecords; //  Include outliers in KPI
        dataForTable = rawRecords; // Show individual activity records
    } else {
        // Utilization: Use aggregated data for KPI, raw data for table
        dataForSummary = aggregatedRecords; // For KPI calculation (aggregated)
        dataForTable = rawRecords; // Show individual records with start/end times
    }
    
    // Check if we have any records to display
    if (dataForTable.length === 0) {
        alert('No valid records found for this worker in the current filter');
        return;
    }
    
    // If all records are outliers, show warning but continue
    if (dataForSummary.length === 0 && dataForTable.length > 0) {
        console.warn(` All ${dataForTable.length} records for ${workerName} are outliers (>${AppState.outlierThreshold}%)`);
    }
    
    // � v3.4.1: Count unique shifts from ALL data (not just non-outliers)
    // For Efficiency: Use aggregatedRecords (includes outliers)
    // For Utilization: Use raw data (already using dataForTable)
    const uniqueShifts = new Set();
    const dataForShiftCount = isEfficiency ? aggregatedRecords : dataForTable;
    dataForShiftCount.forEach(r => {
        const shiftKey = `${r.workingDay}_${r.workingShift}`;
        uniqueShifts.add(shiftKey);
    });
    const shiftCount = uniqueShifts.size;
    
    let currentRate, performanceBand, totalValue;
    
    if (isEfficiency) {
        //  FIX: Use aggregated data (outliers already excluded for KPI)
        // If all are outliers, use dataForTable for display but show warning
        const dataForKPI = dataForSummary.length > 0 ? dataForSummary : dataForTable;
        const assignedStandardTime = dataForKPI.reduce((sum, r) => sum + (r.assignedStandardTime || 0), 0);
        const shiftTime = shiftCount * 660; // Total available shift time
        
        currentRate = shiftTime > 0 ? (assignedStandardTime / shiftTime) * 100 : 0;
        performanceBand = getEfficiencyBand(currentRate);
        totalValue = assignedStandardTime;
        
        console.log(` Worker Detail (Efficiency) for ${workerName}:`, {
            assignedStandardTime: assignedStandardTime.toFixed(1),
            shiftTime: shiftTime,
            shiftCount,
            efficiencyRate: currentRate.toFixed(1) + '%',
            performanceBand: performanceBand.label,
            recordCount: dataForSummary.length,
            calculation: `${assignedStandardTime.toFixed(1)} / ${shiftTime} * 100 = ${currentRate.toFixed(1)}%`
        });
    } else {
        //  FIX: Use aggregated totalMinutes from cachedWorkerAgg (already deduped)
        const totalMinutes = dataForSummary.reduce((sum, r) => sum + (r.totalMinutes || 0), 0);
        const availableTime = shiftCount * 660;
        
        currentRate = availableTime > 0 ? (totalMinutes / availableTime) * 100 : 0;
        performanceBand = getUtilizationBand(currentRate);
        totalValue = totalMinutes;
        
        console.log(` Worker Detail (Utilization) for ${workerName}:`, {
            actualWorkTime: totalValue.toFixed(1),
            availableTime,
            shiftCount,
            utilizationRate: currentRate.toFixed(1) + '%',
            performanceBand: performanceBand.label,
            recordCount: dataForSummary.length,
            calculation: `${totalValue.toFixed(1)} / ${availableTime} * 100 = ${currentRate.toFixed(1)}%`,
            note: 'Using cachedWorkerAgg.totalMinutes (aggregated, overlap-removed)'
        });
    }
    
    // Update modal header and summary
    document.getElementById('modalWorkerName').innerHTML = `<i class="fas fa-user-circle mr-2"></i>${workerName}`;
    
    // Update modal KPIs based on metric type
    if (isEfficiency) {
        // Efficiency Mode: Show Shifts, Adjusted S/T, Shift Time
        const assignedStandardTime = dataForSummary.reduce((sum, r) => sum + (r.assignedStandardTime || 0), 0);
        const shiftTime = shiftCount * 660; // Total available shift time
        const assignedHours = assignedStandardTime / 60;
        const shiftHours = shiftTime / 60;
        
        // Update card labels for Efficiency
        document.querySelector('#modalTotalShifts').closest('.bg-white').querySelector('.text-gray-600').textContent = 'Total Shifts';
        document.querySelector('#modalTotalShiftTime').closest('.bg-white').querySelector('.text-gray-600').textContent = 'Total Adjusted S/T';
        document.querySelector('#modalTotalMinutes').closest('.bg-white').querySelector('.text-gray-600').textContent = 'Total Shift Time';
        document.querySelector('#modalWorkRate').closest('.bg-white').querySelector('.text-gray-600').textContent = 'Efficiency Rate (Shift Productivity)';
        
        // Update values with comma formatting
        document.getElementById('modalTotalShifts').textContent = shiftCount.toLocaleString();
        document.getElementById('modalTotalShiftTime').textContent = assignedHours.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' hr';
        document.getElementById('modalTotalMinutes').textContent = shiftHours.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' hr';
        document.getElementById('modalWorkRate').textContent = currentRate.toFixed(1) + '%';
        
        // Update descriptions
        document.querySelector('#modalTotalShifts').nextElementSibling.textContent = 'shifts';
        document.querySelector('#modalTotalShiftTime').nextElementSibling.textContent = 'standard time';
        document.querySelector('#modalTotalMinutes').nextElementSibling.textContent = 'available';
        document.querySelector('#modalWorkRate').nextElementSibling.textContent = 'performance';
    } else {
        // Utilization Mode: Show Shifts, Shift Time, Work Time
        const totalShiftMinutes = shiftCount * 660;
        const totalShiftHours = totalShiftMinutes / 60;
        const totalValueHours = totalValue / 60;
        
        // Update card labels for Utilization
        document.querySelector('#modalTotalShifts').closest('.bg-white').querySelector('.text-gray-600').textContent = 'Total Shifts';
        document.querySelector('#modalTotalShiftTime').closest('.bg-white').querySelector('.text-gray-600').textContent = 'Total Shift Time';
        document.querySelector('#modalTotalMinutes').closest('.bg-white').querySelector('.text-gray-600').textContent = 'Total Work Time';
        document.querySelector('#modalWorkRate').closest('.bg-white').querySelector('.text-gray-600').textContent = 'Work Rate';
        
        // Update values with comma formatting
        document.getElementById('modalTotalShifts').textContent = shiftCount.toLocaleString();
        document.getElementById('modalTotalShiftTime').textContent = totalShiftHours.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' hr';
        document.getElementById('modalTotalMinutes').textContent = totalValueHours.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' hr';
        document.getElementById('modalWorkRate').textContent = currentRate.toFixed(1) + '%';
        
        // Update descriptions
        document.querySelector('#modalTotalShifts').nextElementSibling.textContent = 'shifts';
        document.querySelector('#modalTotalShiftTime').nextElementSibling.textContent = 'available';
        document.querySelector('#modalTotalMinutes').nextElementSibling.textContent = 'actual';
        document.querySelector('#modalWorkRate').nextElementSibling.textContent = 'performance';
    }
    
    // Set Total Records count based on table data (individual activity records)
    document.getElementById('modalRecordCount').textContent = dataForTable.length.toLocaleString();
    
    //  FIX: Remove background color, only use text color
    const bandElement = document.getElementById('modalPerformanceBand');
    bandElement.textContent = performanceBand.label;
    bandElement.style.backgroundColor = 'transparent';
    bandElement.style.color = performanceBand.textColor;
    
    // Update glossary based on metric type
    const glossaryDiv = document.getElementById('modalGlossary');
    if (isEfficiency) {
        glossaryDiv.innerHTML = `
            <strong class="text-purple-700">Work Efficiency Glossary (Shift Productivity):</strong><br>
            �� <strong>S/T</strong>: Standard Time - Expected time to complete a task<br>
            �� <strong>Worker Rate(%)</strong>: Work Progress Rate - Portion of the task completed by this worker (e.g., 60% of the task)<br>
            �� <strong>Adjusted S/T(m)</strong>: Adjusted Standard Time = S/T � Worker Rate ÷ 100<br>
            �� <strong>Shift Time</strong>: Available shift time (660 minutes = 11 hours)<br>
            �� <strong>Efficiency(%)</strong>: Shift productivity = Adjusted S/T ÷ Shift Time � 100<br>
            �� <strong>� Outlier</strong>: Records with efficiency > ${AppState.outlierThreshold || 1000}% (shown in red for visual reference, but <strong>included in all calculations</strong>)<br>
            <br>
            <strong class="text-purple-600"> Note:</strong> Efficiency (also called "Shift Productivity") measures how much standard work was completed per shift. 100% = completed exactly the standard amount of work in one shift (660 min).
        `;
    } else {
        glossaryDiv.innerHTML = `
            <strong class="text-blue-700">Time Utilization Glossary:</strong><br>
            �� <strong>Original(m)</strong>: Time calculated from End - Start time<br>
            �� <strong>Adjusted(m)</strong>: Original time after removing overlapping intervals<br>
            �� <strong>Removed overlap</strong>: Duplicate time periods detected and excluded<br>
            �� <strong>Utilization Rate</strong>: Adjusted time ÷ Available shift time � 100
        `;
    }
    
    // Render charts based on metric type
    if (isEfficiency) {
        //  Charts need aggregated data with assignedStandardTime
        renderEfficiencyCharts(aggregatedRecords);
    } else {
        renderUtilizationCharts(dataForTable);
    }
    
    // Render records table based on metric type
    const tableBody = document.getElementById('modalRecordsTable');
    if (isEfficiency) {
        //  Table shows individual records (rawRecords)
        renderEfficiencyTable(dataForTable, tableBody);
    } else {
        renderUtilizationTable(dataForTable, tableBody);
    }
    
    // Show modal
    document.getElementById('workerDetailModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Render Time Utilization charts
function renderUtilizationCharts(workerRecords) {
    // Update chart titles for Utilization mode
    const dailyChartTitle = document.getElementById('modalDailyChartTitle');
    const hourlyChartTitle = document.getElementById('modalHourlyChartTitle');
    if (dailyChartTitle) {
        dailyChartTitle.innerHTML = '<i class="fas fa-calendar-day mr-2"></i>Daily Work Time';
    }
    if (hourlyChartTitle) {
        hourlyChartTitle.innerHTML = '<i class="fas fa-clock mr-2"></i>Hourly Work Distribution';
    }
    
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
    // Update chart titles for Efficiency mode
    const dailyChartTitle = document.getElementById('modalDailyChartTitle');
    const hourlyChartTitle = document.getElementById('modalHourlyChartTitle');
    if (dailyChartTitle) {
        dailyChartTitle.innerHTML = '<i class="fas fa-calendar-day mr-2"></i>Daily Efficiency Rate (Shift Productivity)';
    }
    if (hourlyChartTitle) {
        hourlyChartTitle.innerHTML = '<i class="fas fa-clock mr-2"></i>Hourly Adjusted S/T Distribution';
    }
    
    // Group by date for daily chart (show efficiency rate %)
    const dailyData = {};
    const dailyShifts = {}; // Track unique shifts per date
    
    workerRecords.forEach(r => {
        const date = r.workingDay || 'Unknown';
        if (!dailyData[date]) {
            dailyData[date] = { assigned: 0 };
            dailyShifts[date] = new Set();
        }
        //  Use aggregated data fields
        dailyData[date].assigned += r.assignedStandardTime || 0;
        
        // Track unique shifts per date
        const shiftKey = `${r.workingDay}_${r.workingShift}`;
        dailyShifts[date].add(shiftKey);
    });
    
    const dates = Object.keys(dailyData).sort();
    const dailyEfficiency = dates.map(d => {
        const assigned = dailyData[d].assigned;
        const shiftCount = dailyShifts[d].size;
        const shiftTime = shiftCount * 660; // Total shift time for the day
        return shiftTime > 0 ? (assigned / shiftTime) * 100 : 0;
    });
    
    // Destroy existing daily chart
    if (modalCharts.daily) {
        modalCharts.daily.destroy();
    }
    
    // Create daily chart (Efficiency %, purple theme)
    const dailyCtx = document.getElementById('modalDailyChart');
    if (!dailyCtx) {
        console.error('modalDailyChart canvas not found');
        return;
    }
    
    modalCharts.daily = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Efficiency (Shift Productivity, %)',
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
                    title: { display: true, text: 'Shift Productivity (%)' }
                }
            }
        }
    });
    
    //  Hourly distribution: Use raw processedData for individual time records
    const processCtx = document.getElementById('modalProcessChart');
    if (modalCharts.process) {
        modalCharts.process.destroy();
    }
    
    if (!processCtx) {
        console.error('modalProcessChart canvas not found');
        return;
    }
    
    // Get worker name from first record
    const workerName = workerRecords[0]?.workerName;
    
    // Get raw records for hourly distribution (need startDatetime)
    const rawRecords = (AppState.processedData || []).filter(r => {
        if (r.workerName !== workerName || r.rework || !r.startDatetime) {
            return false;
        }
        
        //  FIX: Use correct field names from parseRawData
        const st = r['Worker S/T'] || 0;
        const rate = r['Worker Rate(%)'] || 0;
        const assigned = (st * rate) / 100;
        const actual = r['Worker Act'] || 0;
        const efficiency = actual > 0 ? (assigned / actual) * 100 : 0;
        
        return efficiency <= AppState.outlierThreshold; // Apply outlier threshold
    });
    
    if (rawRecords.length === 0) {
        // No hourly data available
        modalCharts.process = new Chart(processCtx, {
            type: 'bar',
            data: {
                labels: ['No hourly data available'],
                datasets: [{
                    label: 'N/A',
                    data: [0],
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: 'No time records with valid start times'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 1
                    }
                }
            }
        });
        return;
    }
    
    // Group by hour - Show Adjusted S/T (min) per hour
    const hourlyData = {};
    rawRecords.forEach(r => {
        const hour = r.startDatetime.getHours();
        if (!hourlyData[hour]) {
            hourlyData[hour] = 0;
        }
        //  FIX: Use correct field names Worker S/T and Worker Rate(%)
        const st = r['Worker S/T'] || 0;
        const rate = r['Worker Rate(%)'] || 0;
        const assigned = (st * rate) / 100;
        
        hourlyData[hour] += assigned;
    });
    
    // Sort hours
    const hours = Object.keys(hourlyData).map(Number).sort((a, b) => a - b);
    const hourlyAssigned = hours.map(h => hourlyData[h]);
    
    // Create hourly chart - Show Adjusted S/T (min)
    modalCharts.process = new Chart(processCtx, {
        type: 'bar',
        data: {
            labels: hours.map(h => `${h}:00`),
            datasets: [{
                label: 'Adjusted S/T (min)',
                data: hourlyAssigned,
                backgroundColor: 'rgba(139, 92, 246, 0.7)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.parsed.y.toFixed(0)} min`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Adjusted S/T (min)' }
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
    const outlierThreshold = AppState.outlierThreshold || 1000;
    
    tableBody.innerHTML = workerRecords
        .sort((a, b) => (b.workingDay || '').localeCompare(a.workingDay || ''))
        .map(r => {
            // Use individual record fields
            const st = r['Worker S/T'] || 0;
            const rate = r['Worker Rate(%)'] || 0;
            const assigned = (st * rate / 100) || 0;  // Adjusted S/T = S/T � Rate ÷ 100
            const actual = r['Worker Act'] || 0;
            
            // Calculate efficiency for this individual record
            const efficiency = assigned > 0 && actual > 0 ? (assigned / actual) * 100 : 0;
            
            // Check if outlier
            const isOutlier = efficiency > outlierThreshold;
            const rowClass = isOutlier ? 'modal-outlier-row' : 'hover:bg-gray-50';
            const outlierIcon = isOutlier ? `<i class="fas fa-ban text-red-500 mr-1" title="Outlier: Efficiency ${efficiency.toFixed(1)}% (>${outlierThreshold}%)"></i>` : '';
            
            return `
                <tr class="${rowClass}">
                    <td class="p-2">${outlierIcon}${r.workingDay || '-'}</td>
                    <td class="p-2"><span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">${r.workingShift || '-'} ${r.actualShift || ''}</span></td>
                    <td class="p-2 font-medium">${r.foDesc3 || '-'}</td>
                    <td class="p-2 text-right text-gray-600">${Math.round(st)}</td>
                    <td class="p-2 text-right text-gray-600">${rate.toFixed(0)}%</td>
                    <td class="p-2 text-right text-gray-900">${Math.round(assigned)}</td>
                    <td class="p-2 text-right text-gray-900">${Math.round(actual)}</td>
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

// Show loading overlay with custom message
function showLoadingOverlay(message = 'Processing...') {
    const overlay = document.getElementById('metricTransitionOverlay');
    const transitionText = document.getElementById('transitionText');
    if (overlay && transitionText) {
        transitionText.textContent = message;
        overlay.classList.remove('hidden', 'fade-out');
        overlay.classList.add('fade-in');
    }
}

// Hide loading overlay
function hideLoadingOverlay() {
    const overlay = document.getElementById('metricTransitionOverlay');
    if (overlay) {
        overlay.classList.remove('fade-in');
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('fade-out');
        }, 300);
    }
}

// Show success message (auto-hide after 3 seconds)
function showSuccessMessage(message) {
    // Remove existing success message if any
    const existing = document.getElementById('successMessage');
    if (existing) {
        existing.remove();
    }
    
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.id = 'successMessage';
    successDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(successDiv);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successDiv.style.opacity = '0';
        successDiv.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            successDiv.remove();
        }, 500);
    }, 3000);
}

// Toggle between Time Utilization and Work Efficiency metrics
function toggleMetric() {
    // Show transition overlay
    showLoadingOverlay('Switching metric...');
    
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
        transitionText.textContent = 'Switching to Work Efficiency...';
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
        transitionText.textContent = 'Switching to Time Utilization...';
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
        
        // Hide overlay after report update
        setTimeout(() => {
            hideLoadingOverlay();
            
            // Reset body background after a while (increased duration for visibility)
            setTimeout(() => {
                document.body.style.backgroundColor = '';
            }, 3000);
        }, 500);
    }, 800);
    
    console.log(` Metric switched to: ${AppState.currentMetricType}`);
}

// Sort data table
function sortDataTable(column) {
    //  FIX: Ensure cachedWorkerAgg exists
    if (!AppState.cachedWorkerAgg || AppState.cachedWorkerAgg.length === 0) {
        console.warn(' No cached data available for sorting');
        return;
    }
    
    const sort = AppState.dataTableSort;
    
    // Toggle order if same column, otherwise default to desc
    if (sort.column === column) {
        sort.order = sort.order === 'asc' ? 'desc' : 'asc';
    } else {
        sort.column = column;
        sort.order = 'desc';
    }
    
    const data = [...AppState.cachedWorkerAgg];
    
    console.log(` Sorting by ${column} (${sort.order})`);
    
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
window.toggleAllCheckboxes = toggleAllCheckboxes;
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
window.sortDataTable = sortDataTable;

//  Background Upload Progress Functions
function showUploadProgressBar(uploadId, totalRecords) {
    // Remove existing progress bar if any
    const existingBar = document.getElementById('upload-progress-bar');
    if (existingBar) {
        existingBar.remove();
    }
    
    const bar = document.createElement('div');
    bar.id = 'upload-progress-bar';
    bar.className = 'fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 z-50 shadow-lg';
    bar.innerHTML = `
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-cloud-upload-alt fa-spin"></i>
                    <span class="font-semibold">Saving to database...</span>
                    <span id="progress-text" class="text-blue-100">Uploading... 0%</span>
                </div>
                <div class="text-sm text-blue-100">
                    <i class="far fa-clock mr-1"></i>
                    <span id="elapsed-time">0s</span>
                </div>
            </div>
            <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                <div id="progress-bar-fill" class="h-full bg-white transition-all duration-500 ease-out" style="width: 0%"></div>
            </div>
            <div class="mt-2 text-xs text-blue-100" id="progress-status">
                Starting...
            </div>
        </div>
    `;
    document.body.prepend(bar);
}

function updateProgressBar(progress) {
    const progressText = document.getElementById('progress-text');
    const elapsedTime = document.getElementById('elapsed-time');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressStatus = document.getElementById('progress-status');
    
    if (!progressText) return;
    
    const percentage = progress.percentage || 0;
    const elapsed = progress.elapsed || 0;
    const current = progress.current || 0;
    const total = progress.total || 0;
    
    progressText.textContent = `Uploading... ${Math.round(percentage)}%`;
    elapsedTime.textContent = `${Math.floor(elapsed / 60)}m ${elapsed % 60}s elapsed`;
    progressBarFill.style.width = `${percentage}%`;
    
    if (progress.status === 'processing') {
        progressStatus.textContent = `Processing... ${percentage}% complete`;
    } else if (progress.status === 'completed') {
        progressStatus.textContent = ' Upload completed successfully!';
    } else if (progress.status === 'error') {
        progressStatus.textContent = ` Error: ${progress.error || 'Unknown error'}`;
    }
}

function hideUploadProgressBar() {
    const bar = document.getElementById('upload-progress-bar');
    if (bar) {
        // Fade out animation
        bar.style.transition = 'opacity 0.5s';
        bar.style.opacity = '0';
        setTimeout(() => bar.remove(), 500);
    }
}

let progressPollingInterval = null;
let estimatedProgress = 0;

function startProgressPolling(uploadId) {
    // Clear existing interval if any
    if (progressPollingInterval) {
        clearInterval(progressPollingInterval);
    }
    
    // Reset estimated progress
    estimatedProgress = 0;
    
    // Update progress bar with estimation (faster feedback)
    const estimationInterval = setInterval(() => {
        estimatedProgress += 1; // Increase by 1% every 500ms
        if (estimatedProgress > 95) {
            estimatedProgress = 95; // Cap at 95% until real completion
        }
        
        updateProgressBar({
            percentage: estimatedProgress,
            current: 0,
            total: 0,
            status: 'processing',
            message: 'Saving to database...'
        });
    }, 500);
    
    // Poll every 5 seconds (less frequent to avoid slow API)
    progressPollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/upload-progress/${uploadId}`);
            
            // If response takes too long, skip this check
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
            );
            
            const progress = await Promise.race([
                response.json(),
                timeoutPromise
            ]).catch(() => null);
            
            if (!progress || !progress.success) {
                // Continue with estimation
                return;
            }
            
            // Update with real progress (only if higher than estimation OR completed)
            if (progress.percentage > estimatedProgress || progress.status === 'completed') {
                estimatedProgress = progress.percentage;
            }
            updateProgressBar(progress);
            
            // Stop polling if completed or error
            if (progress.status === 'completed') {
                clearInterval(progressPollingInterval);
                clearInterval(estimationInterval);
                
                // Show 100% completion
                updateProgressBar({
                    percentage: 100,
                    current: progress.total,
                    total: progress.total,
                    status: 'completed',
                    message: 'Complete!'
                });
                
                // Show success message
                setTimeout(() => {
                    hideUploadProgressBar();
                    
                    // Refresh uploads list
                    loadUploadsList();
                    
                    // Show success notification
                    const saveStatus = document.getElementById('saveStatus');
                    if (saveStatus) {
                        saveStatus.classList.remove('hidden');
                        saveStatus.classList.add('bg-green-100', 'border-green-400', 'text-green-700');
                        saveStatus.innerHTML = `
                            <strong>Success!</strong> Data saved to database.
                            <button onclick="this.parentElement.classList.add('hidden')" class="float-right">�</button>
                        `;
                    }
                }, 2000);
                
            } else if (progress.status === 'error') {
                clearInterval(progressPollingInterval);
                clearInterval(estimationInterval);
                
                setTimeout(() => {
                    hideUploadProgressBar();
                    alert(`Upload failed: ${progress.error}`);
                }, 2000);
            }
            
        } catch (error) {
            // Continue with estimation on error
            console.warn('Progress polling error (continuing with estimation):', error);
        }
    }, 5000); // Poll every 5 seconds
}


// ============================================================================
// ============================================================================
// DASHBOARD MODULE - Completely Redesigned
// ============================================================================

const DashboardState = {
  currentKPI: 'util',
  currentShiftMode: 'daynight',
  charts: {}
};

// ========== Main Dashboard Refresh ==========
function refreshExecutiveDashboard() {
  if (!AppState.processedData || AppState.processedData.length === 0) {
    console.warn(' No data for dashboard');
    return;
  }
  
  console.log('Refreshing Executive Dashboard...');
  const data = AppState.processedData;
  
  // 1. Flight Deck - REMOVED (HTML element removed from dashboard)
  // updateFlightDeck(data);
  
  // 2. Focus Queue
  updateFocusQueue(data);
  // 3. Trend
  refreshTrendChart();
  // 4. Contribution
  refreshContributionChart();
  // 5. Shift
  refreshShiftChart();
  // 6. Health Matrix
  refreshHealthMatrix(data);
  
  console.log('Dashboard refreshed');
}

// ========== 1. Flight Deck ==========
function updateFlightDeck(data) {
  console.log('updateFlightDeck called with', data.length, 'records');
  if (data.length > 0) {
    console.log('Sample record:', data[0]);
  }
  
  // Calculate KPIs from raw data by aggregating by worker
  const workerStats = new Map();
  
  let skippedCount = 0;
  data.forEach(r => {
    if (!r.workerName || !r.validFlag) {
      skippedCount++;
      return;
    }
    
    const key = r.workerName;
    if (!workerStats.has(key)) {
      workerStats.set(key, {
        totalMinutes: 0,
        assignedStandardTime: 0,
        shiftCount: new Set()
      });
    }
    
    const stats = workerStats.get(key);
    stats.totalMinutes += (r.workerActMins || 0);
    stats.assignedStandardTime += (r.workerST || 0);
    if (r.workingDay && r.workingShift) {
      stats.shiftCount.add(`${r.workingDay}_${r.workingShift}`);
    }
  });
  
  console.log(`Aggregated ${workerStats.size} workers from ${data.length} records`);
  
  // Calculate totals (CORRECTED: Use Total/Total method like Report page)
  let totalWorkTime = 0;
  let totalAssignedST = 0;
  let totalShiftCount = 0;
  let countWorkers = 0;
  
  workerStats.forEach((stats, workerName) => {
    const shiftCount = stats.shiftCount.size;
    if (shiftCount === 0) return;
    
    totalWorkTime += stats.totalMinutes;
    totalAssignedST += stats.assignedStandardTime;
    totalShiftCount += shiftCount;
    countWorkers++;
    
    if (countWorkers <= 3) {
      const util = (stats.totalMinutes / (660 * shiftCount)) * 100;
      console.log(`Worker: ${workerName}, Shift Count: ${shiftCount}, Work Time: ${stats.totalMinutes}, Assigned ST: ${stats.assignedStandardTime}, Util: ${util.toFixed(1)}%`);
    }
  });
  
  // Calculate averages using Total/Total method (same as Report page)
  const totalShiftTime = totalShiftCount * 660;
  const avgUtil = totalShiftTime > 0 ? ((totalWorkTime / totalShiftTime) * 100).toFixed(1) : 0;
  const avgEff = totalShiftTime > 0 ? ((totalAssignedST / totalShiftTime) * 100).toFixed(1) : 0;
  
  console.log(`Final KPIs (Total/Total method):`);
  console.log(`  Workers=${countWorkers}`);
  console.log(`  Total Shift Count=${totalShiftCount}, Total Shift Time=${totalShiftTime} min`);
  console.log(`  Total Work Time=${totalWorkTime} min, Avg Util=${avgUtil}%`);
  console.log(`  Total Assigned S/T=${totalAssignedST} min, Avg Eff=${avgEff}%`);
  
  document.getElementById('flightWorkers').textContent = countWorkers;
  document.getElementById('flightUtil').textContent = avgUtil + '%';
  document.getElementById('flightEff').textContent = avgEff + '%';
  document.getElementById('flightRecords').textContent = data.length.toLocaleString();
  
  // Draw sparklines with real trend data (last 7 days)
  drawSparklineWithTrend('sparkWorkers', data, 'workers');
  drawSparklineWithTrend('sparkUtil', data, 'util');
  drawSparklineWithTrend('sparkEff', data, 'eff');
  drawSparklineWithTrend('sparkRecords', data, 'records');
}

function drawSparklineWithTrend(canvasId, data, type) {
  console.log(`Drawing sparkline with trend for ${canvasId}, type=${type}`);
  
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(` Canvas not found: ${canvasId}`);
    return;
  }
  
  // Group data by date
  const dateGroups = {};
  data.forEach(r => {
    const date = r.workingDay;
    if (!dateGroups[date]) {
      dateGroups[date] = { workers: new Set(), totalUtil: 0, totalEff: 0, countUtil: 0, countEff: 0, records: 0 };
    }
    dateGroups[date].workers.add(r.workerName);
    if (r.utilizationRate >= 0 && r.utilizationRate <= 1000) {
      dateGroups[date].totalUtil += r.utilizationRate;
      dateGroups[date].countUtil++;
    }
    if (r.efficiencyRate >= 0 && r.efficiencyRate <= 1000) {
      dateGroups[date].totalEff += r.efficiencyRate;
      dateGroups[date].countEff++;
    }
    dateGroups[date].records++;
  });
  
  // Get last 7 dates
  const dates = Object.keys(dateGroups).sort().slice(-7);
  
  // Calculate values for each date
  let values = [];
  dates.forEach(date => {
    const g = dateGroups[date];
    switch(type) {
      case 'workers':
        values.push(g.workers.size);
        break;
      case 'util':
        values.push(g.countUtil > 0 ? g.totalUtil / g.countUtil : 0);
        break;
      case 'eff':
        values.push(g.countEff > 0 ? g.totalEff / g.countEff : 0);
        break;
      case 'records':
        values.push(g.records);
        break;
    }
  });
  
  // If less than 7 days, pad with first value
  while (values.length < 7) {
    values.unshift(values[0] || 0);
  }
  
  console.log(`Sparkline ${canvasId} values:`, values);
  
  // Destroy existing chart
  if (DashboardState.charts[canvasId]) {
    DashboardState.charts[canvasId].destroy();
  }
  
  // Draw chart
  try {
    DashboardState.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['', '', '', '', '', '', ''],
        datasets: [{
          data: values,
          borderColor: '#3b82f6',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false }, 
          tooltip: { enabled: false } 
        },
        scales: {
          x: { display: false },
          y: { 
            display: false,
            beginAtZero: true
          }
        }
      }
    });
    console.log(`Sparkline chart created: ${canvasId}`);
  } catch (error) {
    console.error(` Error creating sparkline ${canvasId}:`, error);
  }
}

function drawSparkline(canvasId, data) {
  console.log(`Drawing sparkline for ${canvasId}:`, data);
  
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(` Canvas not found: ${canvasId}`);
    return;
  }
  
  console.log(`Canvas found: ${canvasId}, dimensions: ${canvas.width}x${canvas.height}`);
  
  // Check if Chart.js is loaded
  if (typeof Chart === 'undefined') {
    console.error(' Chart.js is not loaded!');
    return;
  }
  
  // Destroy existing chart
  if (DashboardState.charts[canvasId]) {
    console.log(`Destroying existing chart: ${canvasId}`);
    DashboardState.charts[canvasId].destroy();
  }
  
  try {
    DashboardState.charts[canvasId] = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['', '', '', '', '', '', ''],
        datasets: [{
          data: data,
          borderColor: '#3b82f6',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          fill: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false }, 
          tooltip: { enabled: false } 
        },
        scales: {
          x: { display: false },
          y: { 
            display: false,
            beginAtZero: true
          }
        }
      }
    });
    console.log(`Chart created successfully: ${canvasId}`);
  } catch (error) {
    console.error(` Error creating chart ${canvasId}:`, error);
  }
}

// ========== 2. Focus Queue ==========
function updateFocusQueue(data) {
  const warnings = generateWarnings(data);
  const container = document.getElementById('focusQueueContainer');
  
  if (warnings.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">No critical issues detected. Performance metrics within normal range.</p>';
    document.getElementById('showAllWarnings').classList.add('hidden');
    return;
  }
  
  const top3 = warnings.slice(0, 3);
  container.innerHTML = top3.map(w => `
    <div class="border-l-4 ${w.color} bg-${w.bgColor} p-3 mb-3 rounded">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <p class="text-sm font-bold text-gray-800">${w.severity} | ${w.title}</p>
          <p class="text-xs text-gray-600 mt-1">${w.evidence}</p>
        </div>
      </div>
    </div>
  `).join('');
  
  if (warnings.length > 3) {
    document.getElementById('showAllWarnings').classList.remove('hidden');
  }
}

function generateWarnings(data) {
  const warnings = [];
  const aggregated = AppState.aggregatedData || [];
  
  if (aggregated.length === 0) return warnings;
  
  // Rule 1: Low Utilization
  let totalUtil = 0, countUtil = 0;
  aggregated.forEach(r => {
    if (r.utilizationRate >= 0 && r.utilizationRate <= 100) {
      totalUtil += r.utilizationRate;
      countUtil++;
    }
  });
  const avgUtil = countUtil > 0 ? totalUtil / countUtil : 0;
  
  if (avgUtil < 50 && countUtil >= 10) {
    warnings.push({
      severity: 'CRITICAL',
      icon: '',
      color: 'border-red-500',
      bgColor: 'red-50',
      title: 'Low Overall Utilization Detected',
      evidence: `Current average: ${avgUtil.toFixed(1)}% (threshold: <50%)`
    });
  }
  
  // Rule 2: Low Efficiency
  let totalEff = 0, countEff = 0;
  aggregated.forEach(r => {
    if (r.efficiencyRate >= 0 && r.efficiencyRate <= 200) {
      totalEff += r.efficiencyRate;
      countEff++;
    }
  });
  const avgEff = countEff > 0 ? totalEff / countEff : 0;
  
  if (avgEff < 50 && countEff >= 10) {
    warnings.push({
      severity: 'CRITICAL',
      icon: '',
      color: 'border-red-500',
      bgColor: 'red-50',
      title: 'Low Overall Efficiency Detected',
      evidence: `Current average: ${avgEff.toFixed(1)}% (threshold: <50%)`
    });
  }
  
  // Rule 3: High variance (inconsistent performance)
  if (countUtil >= 10) {
    const utilVariance = aggregated.reduce((sum, r) => {
      const diff = r.utilizationRate - avgUtil;
      return sum + (diff * diff);
    }, 0) / countUtil;
    const utilStdDev = Math.sqrt(utilVariance);
    
    if (utilStdDev > 20) {
      warnings.push({
        severity: 'WARNING',
        icon: '',
        color: 'border-yellow-500',
        bgColor: 'yellow-50',
        title: 'High Performance Variance',
        evidence: `Standard deviation: ${utilStdDev.toFixed(1)}% (indicates inconsistent performance)`
      });
    }
  }
  
  return warnings.sort((a, b) => {
    const severityOrder = { CRITICAL: 3, WARNING: 2, INFO: 1 };
    return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
  });
}

// ========== 3. KPI Trend Intelligence (REWRITTEN) ==========
function refreshTrendChart() {
  const period = document.getElementById('trendPeriod').value;
  const kpi = document.getElementById('trendKPI').value;
  const processFilterEl = document.getElementById('trendProcess');
  const processFilter = processFilterEl ? processFilterEl.value : 'all';
  
  const data = AppState.aggregatedData || [];
  
  console.log(`Refreshing Trend Chart: period=${period}, kpi=${kpi}, process=${processFilter}, data=${data.length} entries`);
  
  // Filter by process if selected
  let filteredData = data;
  if (processFilter && processFilter !== 'all') {
    filteredData = data.filter(d => d.foDesc2 === processFilter);
    console.log(`Filtered to ${filteredData.length} entries for process: ${processFilter}`);
  }
  
  if (DashboardState.charts.trend) {
    DashboardState.charts.trend.destroy();
  }
  
  const ctx = document.getElementById('trendChart').getContext('2d');
  
  // Handle "Both" option - show Utilization and Efficiency together
  if (kpi === 'both') {
    const utilAggregated = aggregateByPeriod(filteredData, period, 'util');
    const effAggregated = aggregateByPeriod(filteredData, period, 'eff');
    
    console.log(`Aggregated to ${utilAggregated.labels.length} periods (both KPIs)`);
    
    DashboardState.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: utilAggregated.labels,
        datasets: [
          {
            label: 'Utilization %',
            data: utilAggregated.values,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Efficiency %',
            data: effAggregated.values,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const date = utilAggregated.labels[index];
            openPeriodModal(date, 'both');
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            max: 100,
            title: { display: true, text: 'Utilization (%)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true,
            title: { display: true, text: 'Efficiency (%)' },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  } else {
    // Single KPI mode
    const aggregated = aggregateByPeriod(filteredData, period, kpi);
    
    console.log(`Aggregated to ${aggregated.labels.length} periods`);
    console.log(`Sample data:`, aggregated.labels.slice(0, 5), aggregated.values.slice(0, 5));
    
    DashboardState.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: aggregated.labels,
        datasets: [{
          label: kpi === 'util' ? 'Utilization %' : 'Efficiency %',
          data: aggregated.values,
          borderColor: kpi === 'util' ? '#10b981' : '#a855f7',
          backgroundColor: kpi === 'util' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(168, 85, 247, 0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const date = aggregated.labels[index];
            openPeriodModal(date, kpi);
          }
        },
        plugins: {
          legend: { display: true, position: 'top' },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: kpi === 'util' ? 100 : undefined,
            title: { display: true, text: 'Rate (%)' }
          }
        }
      }
    });
  }
}

function aggregateByPeriod(data, period, kpi) {
  const grouped = {};
  
  data.forEach(r => {
    const key = period === 'daily' ? r.workingDay : getWeekKey(r.workingDay);
    if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };
    
    const rate = kpi === 'util' ? r.utilizationRate : r.efficiencyRate;
    if (rate >= 0 && rate <= 1000) {
      grouped[key].sum += rate;
      grouped[key].count++;
    }
  });
  
  const labels = Object.keys(grouped).sort();
  const values = labels.map(l => grouped[l].count > 0 ? grouped[l].sum / grouped[l].count : 0);
  
  return { labels, values };
}

function getWeekKey(date) {
  const d = new Date(date);
  const week = Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 604800000);
  return `Week ${week}`;
}

// ========== 4. What Changed & Why (REWRITTEN) ==========
function refreshContributionChart() {
  const period = document.getElementById('contributionPeriod').value;
  const kpi = document.getElementById('contributionKPI').value;
  const data = AppState.aggregatedData || [];
  
  console.log(`Refreshing Contribution Chart: period=${period}, kpi=${kpi}, data=${data.length} entries`);
  
  if (data.length === 0) {
    document.getElementById('contributionOverall').textContent = 'No data';
    return;
  }
  
  // Get all unique dates sorted
  const dates = [...new Set(data.map(r => r.workingDay))].sort();
  
  if (dates.length < 2) {
    document.getElementById('contributionOverall').textContent = 'Not enough data';
    return;
  }
  
  // Determine comparison period based on selection
  let currentPeriod, previousPeriod;
  let periodDays;
  
  if (period === '7d') {
    periodDays = 7;
  } else if (period === '14d') {
    periodDays = 14;
  } else if (period === '30d') {
    periodDays = 30;
  } else {
    periodDays = 7; // default
  }
  
  const latestDate = new Date(dates[dates.length - 1]);
  const periodStartDate = new Date(latestDate);
  periodStartDate.setDate(periodStartDate.getDate() - periodDays);
  const previousPeriodEndDate = new Date(periodStartDate);
  const previousPeriodStartDate = new Date(previousPeriodEndDate);
  previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - periodDays);
  
  // Current period: last N days
  currentPeriod = data.filter(r => {
    const d = new Date(r.workingDay);
    return d > periodStartDate && d <= latestDate;
  });
  
  // Previous period: N days before that
  previousPeriod = data.filter(r => {
    const d = new Date(r.workingDay);
    return d > previousPeriodStartDate && d <= previousPeriodEndDate;
  });
  
  console.log(`Period: ${periodDays} days`);
  console.log(`Current period: ${periodStartDate.toISOString().split('T')[0]} to ${latestDate.toISOString().split('T')[0]} (${currentPeriod.length} records)`);
  console.log(`Previous period: ${previousPeriodStartDate.toISOString().split('T')[0]} to ${previousPeriodEndDate.toISOString().split('T')[0]} (${previousPeriod.length} records)`);
  
  if (currentPeriod.length === 0 || previousPeriod.length === 0) {
    document.getElementById('contributionOverall').textContent = 'Insufficient comparison data';
    return;
  }
  
  // Calculate metrics by process for both periods
  const calcByProcess = (periodData) => {
    const processes = {};
    periodData.forEach(r => {
      const proc = r.foDesc2 || 'Unknown';
      if (!processes[proc]) {
        processes[proc] = { 
          totalShiftTime: 0, 
          totalWorkTime: 0, 
          totalStandardTime: 0 
        };
      }
      const shiftTime = (r.shiftCount || 0) * 660;
      processes[proc].totalShiftTime += shiftTime;
      processes[proc].totalWorkTime += r.totalActualMins || 0;
      processes[proc].totalStandardTime += r.totalStandardTime || 0;
    });
    
    // Calculate rate for each process
    Object.keys(processes).forEach(proc => {
      const p = processes[proc];
      if (kpi === 'util') {
        p.rate = p.totalShiftTime > 0 ? (p.totalWorkTime / p.totalShiftTime) * 100 : 0;
        p.weight = p.totalShiftTime;
      } else {
        p.rate = p.totalShiftTime > 0 ? (p.totalStandardTime / p.totalShiftTime) * 100 : 0;
        p.weight = p.totalShiftTime;
      }
    });
    
    return processes;
  };
  
  const currentMetrics = calcByProcess(currentPeriod);
  const previousMetrics = calcByProcess(previousPeriod);
  
  // Calculate contribution for each process
  const allProcesses = new Set([...Object.keys(currentMetrics), ...Object.keys(previousMetrics)]);
  const contributions = {};
  
  let totalCurrentValue = 0;
  let totalCurrentWeight = 0;
  let totalPreviousValue = 0;
  let totalPreviousWeight = 0;
  
  allProcesses.forEach(proc => {
    const curr = currentMetrics[proc] || { rate: 0, weight: 0 };
    const prev = previousMetrics[proc] || { rate: 0, weight: 0 };
    
    totalCurrentValue += curr.rate * curr.weight;
    totalCurrentWeight += curr.weight;
    totalPreviousValue += prev.rate * prev.weight;
    totalPreviousWeight += prev.weight;
    
    // FIXED: Contribution = (rate change) * average weight
    // This properly captures whether a process improved (+) or declined (-)
    const rateChange = curr.rate - prev.rate;
    const avgWeight = (curr.weight + prev.weight) / 2;
    contributions[proc] = rateChange * avgWeight;
  });
  
  // Calculate overall change
  const overallCurrent = totalCurrentWeight > 0 ? totalCurrentValue / totalCurrentWeight : 0;
  const overallPrevious = totalPreviousWeight > 0 ? totalPreviousValue / totalPreviousWeight : 0;
  const overallChange = overallCurrent - overallPrevious;
  
  const sign = overallChange >= 0 ? '+' : '';
  const color = overallChange >= 0 ? 'text-green-600' : 'text-red-600';
  document.getElementById('contributionOverall').innerHTML = 
    `<span class="${color} font-bold">${sign}${overallChange.toFixed(1)}%</span>`;
  
  // Sort processes by absolute contribution
  const sortedProcesses = Object.keys(contributions)
    .sort((a, b) => Math.abs(contributions[b]) - Math.abs(contributions[a]))
    .slice(0, 10); // Top 10
  
  const labels = sortedProcesses;
  const values = sortedProcesses.map(p => {
    // Normalize contribution to percentage points
    const totalWeight = totalCurrentWeight || 1;
    return (contributions[p] / totalWeight);
  });
  
  console.log(`Overall change: ${overallChange.toFixed(1)}%`);
  console.log(`Top processes:`, labels);
  console.log(`Contributions:`, values.map(v => v.toFixed(2)));
  
  if (DashboardState.charts.contribution) {
    DashboardState.charts.contribution.destroy();
  }
  
  const ctx = document.getElementById('contributionChart').getContext('2d');
  DashboardState.charts.contribution = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Contribution to Change (%)',
        data: values,
        backgroundColor: values.map(v => v >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'),
        borderColor: values.map(v => v >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const val = context.parsed.x;
              return `${val >= 0 ? '+' : ''}${val.toFixed(2)}% points`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Contribution (% points)' }
        }
      }
    }
  });
}

// ========== 5. Shift Comparison (REWRITTEN) ==========
function switchShiftMode(mode) {
  DashboardState.currentShiftMode = mode;
  
  const btnDN = document.getElementById('shiftModeDayNight');
  const btnABC = document.getElementById('shiftModeABC');
  
  if (mode === 'daynight') {
    btnDN.className = 'px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg';
    btnABC.className = 'px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-lg';
  } else {
    btnDN.className = 'px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-lg';
    btnABC.className = 'px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg';
  }
  
  refreshShiftChart();
}

function refreshShiftChart() {
  const mode = DashboardState.currentShiftMode;
  const kpi = document.getElementById('shiftKPI').value;
  const data = AppState.aggregatedData || [];
  
  console.log(`Refreshing Shift Chart: mode=${mode}, kpi=${kpi}, data=${data.length} entries`);
  
  let labels, values;
  
  if (mode === 'daynight') {
    const dayData = data.filter(r => r.workingShift === 'Day');
    const nightData = data.filter(r => r.workingShift === 'Night');
    
    console.log(`Day: ${dayData.length} entries, Night: ${nightData.length} entries`);
    
    labels = ['Day', 'Night'];
    values = [calcAvg(dayData, kpi), calcAvg(nightData, kpi)];
  } else {
    const aData = data.filter(r => r.actualShift === 'A');
    const bData = data.filter(r => r.actualShift === 'B');
    const cData = data.filter(r => r.actualShift === 'C');
    
    console.log(`A: ${aData.length} entries, B: ${bData.length} entries, C: ${cData.length} entries`);
    
    labels = ['A Shift', 'B Shift', 'C Shift'];
    values = [calcAvg(aData, kpi), calcAvg(bData, kpi), calcAvg(cData, kpi)];
  }
  
  console.log(`Values:`, values.map(v => v.toFixed(1)));
  
  if (DashboardState.charts.shift) {
    DashboardState.charts.shift.destroy();
  }
  
  const ctx = document.getElementById('shiftChart').getContext('2d');
  DashboardState.charts.shift = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: kpi === 'util' ? 'Utilization %' : 'Efficiency %',
        data: values,
        backgroundColor: mode === 'daynight' 
          ? ['#fbbf24', '#6366f1']
          : ['#ef4444', '#10b981', '#3b82f6']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.y.toFixed(1)}%`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: kpi === 'util' ? 100 : undefined // Auto scale for efficiency
        }
      }
    }
  });
}

function calcAvg(data, kpi) {
  let sum = 0, count = 0;
  data.forEach(r => {
    const rate = kpi === 'util' ? r.utilizationRate : r.efficiencyRate;
    if (rate >= 0 && rate <= 1000) {
      sum += rate;
      count++;
    }
  });
  return count > 0 ? sum / count : 0;
}

// ========== 6. Process Health Matrix (ENHANCED) ==========
function refreshHealthMatrix(data) {
  const aggregated = AppState.aggregatedData || [];
  
  console.log(`🔄 Refreshing Health Matrix: ${aggregated.length} aggregated entries`);
  
  // Group by process category
  const groups = {};
  
  aggregated.forEach(r => {
    const cat = r.foDesc2 || 'Unknown';
    if (!groups[cat]) groups[cat] = { util: [], eff: [], workers: new Set() };
    
    if (r.utilizationRate >= 0 && r.utilizationRate <= 1000) {
      groups[cat].util.push(r.utilizationRate);
    }
    if (r.efficiencyRate >= 0 && r.efficiencyRate <= 1000) {
      groups[cat].eff.push(r.efficiencyRate);
    }
    groups[cat].workers.add(r.workerName);
  });
  
  const points = Object.keys(groups).map(cat => {
    const utilAvg = groups[cat].util.length > 0 
      ? groups[cat].util.reduce((a,b) => a+b, 0) / groups[cat].util.length 
      : 0;
    const effAvg = groups[cat].eff.length > 0 
      ? groups[cat].eff.reduce((a,b) => a+b, 0) / groups[cat].eff.length 
      : 0;
    
    return {
      x: utilAvg,
      y: effAvg,
      r: Math.sqrt(groups[cat].workers.size) * 3, // Size based on unique workers
      label: cat,
      workers: groups[cat].workers.size,
      records: groups[cat].util.length
    };
  });
  
  console.log(`✅ Generated ${points.length} bubbles`);
  console.log(`📊 Sample:`, points.slice(0, 3).map(p => ({ 
    label: p.label, 
    util: p.x.toFixed(1), 
    eff: p.y.toFixed(1),
    workers: p.workers
  })));
  
  if (DashboardState.charts.matrix) {
    DashboardState.charts.matrix.destroy();
  }
  
  const ctx = document.getElementById('healthMatrixChart').getContext('2d');
  
  // Define quadrant colors and labels
  const getQuadrantInfo = (util, eff) => {
    if (util >= 50 && eff >= 80) {
      return { color: 'rgba(34, 197, 94, 0.7)', label: '✅ Optimal', border: 'rgb(34, 197, 94)' };
    } else if (util >= 50 && eff < 80) {
      return { color: 'rgba(251, 191, 36, 0.7)', label: '⚠️ Capacity Issue', border: 'rgb(251, 191, 36)' };
    } else if (util < 50 && eff >= 80) {
      return { color: 'rgba(59, 130, 246, 0.7)', label: '📊 Underutilized', border: 'rgb(59, 130, 246)' };
    } else {
      return { color: 'rgba(239, 68, 68, 0.7)', label: '🚨 Critical', border: 'rgb(239, 68, 68)' };
    }
  };
  
  DashboardState.charts.matrix = new Chart(ctx, {
    type: 'bubble',
    data: {
      datasets: [{
        label: 'Process Health',
        data: points,
        backgroundColor: points.map(p => getQuadrantInfo(p.x, p.y).color),
        borderColor: points.map(p => getQuadrantInfo(p.x, p.y).border),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: function(context) {
              const point = context[0].raw;
              return `${point.label}`;
            },
            label: function(context) {
              const point = context.raw;
              const quadrant = getQuadrantInfo(point.x, point.y);
              return [
                `Status: ${quadrant.label}`,
                `Utilization: ${point.x.toFixed(1)}%`,
                `Efficiency: ${point.y.toFixed(1)}%`,
                `Workers: ${point.workers}`,
                `Records: ${point.records}`
              ];
            }
          }
        },
        // Add quadrant background annotations
        annotation: {
          annotations: {
            optimal: {
              type: 'box',
              xMin: 50,
              xMax: 100,
              yMin: 80,
              yMax: 200,
              backgroundColor: 'rgba(34, 197, 94, 0.05)',
              borderWidth: 0
            },
            capacity: {
              type: 'box',
              xMin: 50,
              xMax: 100,
              yMin: 0,
              yMax: 80,
              backgroundColor: 'rgba(251, 191, 36, 0.05)',
              borderWidth: 0
            },
            underutilized: {
              type: 'box',
              xMin: 0,
              xMax: 50,
              yMin: 80,
              yMax: 200,
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              borderWidth: 0
            },
            critical: {
              type: 'box',
              xMin: 0,
              xMax: 50,
              yMin: 0,
              yMax: 80,
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              borderWidth: 0
            },
            // Reference lines
            utilLine: {
              type: 'line',
              xMin: 50,
              xMax: 50,
              yMin: 0,
              yMax: 200,
              borderColor: 'rgba(156, 163, 175, 0.4)',
              borderWidth: 2,
              borderDash: [5, 5]
            },
            effLine: {
              type: 'line',
              xMin: 0,
              xMax: 100,
              yMin: 80,
              yMax: 80,
              borderColor: 'rgba(156, 163, 175, 0.4)',
              borderWidth: 2,
              borderDash: [5, 5]
            },
            // Quadrant labels
            optimalLabel: {
              type: 'label',
              xValue: 75,
              yValue: 140,
              content: ['✅ Optimal'],
              color: 'rgba(34, 197, 94, 0.6)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            capacityLabel: {
              type: 'label',
              xValue: 75,
              yValue: 40,
              content: ['⚠️ Capacity Issue'],
              color: 'rgba(251, 191, 36, 0.7)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            underutilizedLabel: {
              type: 'label',
              xValue: 25,
              yValue: 140,
              content: ['📊 Underutilized'],
              color: 'rgba(59, 130, 246, 0.7)',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            criticalLabel: {
              type: 'label',
              xValue: 25,
              yValue: 40,
              content: ['🚨 Critical'],
              color: 'rgba(239, 68, 68, 0.7)',
              font: {
                size: 14,
                weight: 'bold'
              }
            }
          }
        }
      },
      scales: {
        x: {
          title: { 
            display: true, 
            text: 'Utilization %',
            font: { size: 14, weight: 'bold' }
          },
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          }
        },
        y: {
          title: { 
            display: true, 
            text: 'Efficiency %',
            font: { size: 14, weight: 'bold' }
          },
          min: 0,
          max: 200,
          grid: {
            color: 'rgba(156, 163, 175, 0.1)'
          }
        }
      },
      onClick: (event, elements) => {
        if (elements.length > 0) {
          const point = points[elements[0].index];
          const quadrant = getQuadrantInfo(point.x, point.y);
          alert(`📊 ${point.label}\n\n${quadrant.label}\nUtilization: ${point.x.toFixed(1)}%\nEfficiency: ${point.y.toFixed(1)}%\nWorkers: ${point.workers}\nRecords: ${point.records}\n\n💡 Click OK to close`);
        }
      }
    }
  });
}

// ========== Period Detail Modal ==========
// Modal state for filtering and sorting
const ModalState = {
  currentData: [],
  currentSort: { column: 'utilization', direction: 'desc' }
};

function openPeriodModal(date, kpi) {
  const aggregated = AppState.aggregatedData || [];
  const filtered = aggregated.filter(r => r.workingDay === date);
  
  if (filtered.length === 0) {
    alert('No data available for this period');
    return;
  }
  
  // Store data for filtering/sorting
  ModalState.currentData = filtered;
  
  // Calculate detailed summary statistics
  const workers = new Set(filtered.map(r => r.workerName)).size;
  let totalUtil = 0, totalEff = 0, totalWorkTime = 0, totalAdjustedST = 0;
  
  // Calculate Total Shift Time using the same logic as Report page (KPI Cards)
  // Sum all shiftCount from filtered records, then multiply by 660
  const totalShifts = filtered.reduce((sum, r) => sum + (r.shiftCount || 0), 0);
  const totalShiftTime = totalShifts * 660; // Each shift = 11 hours = 660 minutes
  
  filtered.forEach(r => {
    totalUtil += r.utilizationRate || 0;
    totalEff += r.efficiencyRate || 0;
    totalWorkTime += r.totalActualMins || 0;
    totalAdjustedST += r.totalStandardTime || 0;
  });
  
  const avgUtil = filtered.length > 0 ? totalUtil / filtered.length : 0;
  const avgEff = filtered.length > 0 ? totalEff / filtered.length : 0;
  const totalRecords = filtered.reduce((sum, r) => sum + r.recordCount, 0);
  
  console.log('✅ Modal Summary (Fixed):', {
    workers,
    totalShifts,
    avgUtil: avgUtil.toFixed(1),
    avgEff: avgEff.toFixed(1),
    totalShiftTime: `${totalShiftTime} min (${(totalShiftTime / 60).toFixed(1)} hr)`,
    totalWorkTime: `${totalWorkTime} min (${(totalWorkTime / 60).toFixed(1)} hr)`,
    totalAdjustedST: `${totalAdjustedST} min`,
    totalRecords
  });
  
  // Update header
  document.getElementById('modalTitle').textContent = `Period Details: ${date}`;
  document.getElementById('modalSubtitle').textContent = `${filtered.length} worker-shift entries | ${workers} unique workers`;
  
  // Update summary cards
  document.getElementById('modalWorkers').textContent = workers.toLocaleString();
  document.getElementById('modalUtil').textContent = avgUtil.toFixed(1) + '%';
  document.getElementById('modalEff').textContent = avgEff.toFixed(1) + '%';
  
  // Display in hours (hr) with comma formatting
  const totalShiftTimeHr = totalShiftTime / 60;
  const totalWorkTimeHr = totalWorkTime / 60;
  const totalAdjustedSTHr = totalAdjustedST / 60;
  
  document.getElementById('periodModalTotalShiftTime').textContent = totalShiftTimeHr.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' hr';
  document.getElementById('periodModalTotalWorkTime').textContent = totalWorkTimeHr.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' hr';
  document.getElementById('periodModalTotalAdjustedST').textContent = totalAdjustedSTHr.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' hr';
  
  // Draw distribution charts
  drawModalDistributionCharts(filtered);
  
  // Generate process breakdown
  generateProcessBreakdown(filtered);
  
  // Generate top/bottom performers
  generateTopBottomPerformers(filtered);
  
  // Populate process filter dropdown
  const processes = [...new Set(filtered.map(r => r.foDesc2).filter(Boolean))].sort();
  const processFilter = document.getElementById('modalProcessFilter');
  processFilter.innerHTML = '<option value="all">All Processes</option>' + 
    processes.map(p => `<option value="${p}">${p}</option>`).join('');
  
  // Reset filters
  document.getElementById('modalSearchInput').value = '';
  document.getElementById('modalShiftFilter').value = 'all';
  
  // Build table
  renderModalTable(filtered);
  
  // Show modal
  document.getElementById('periodDetailModal').classList.remove('hidden');
}

function drawModalDistributionCharts(data) {
  // Utilization Distribution
  const utilRanges = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0 };
  const effRanges = { '0-20': 0, '20-40': 0, '40-60': 0, '60-80': 0, '80-100': 0, '100+': 0 };
  
  data.forEach(r => {
    const util = r.utilizationRate || 0;
    if (util < 20) utilRanges['0-20']++;
    else if (util < 40) utilRanges['20-40']++;
    else if (util < 60) utilRanges['40-60']++;
    else if (util < 80) utilRanges['60-80']++;
    else utilRanges['80-100']++;
    
    const eff = r.efficiencyRate || 0;
    if (eff < 20) effRanges['0-20']++;
    else if (eff < 40) effRanges['20-40']++;
    else if (eff < 60) effRanges['40-60']++;
    else if (eff < 80) effRanges['60-80']++;
    else if (eff < 100) effRanges['80-100']++;
    else effRanges['100+']++;
  });
  
  // Destroy existing charts
  if (DashboardState.charts.modalUtilDist) DashboardState.charts.modalUtilDist.destroy();
  if (DashboardState.charts.modalEffDist) DashboardState.charts.modalEffDist.destroy();
  
  // Utilization chart
  const utilCtx = document.getElementById('modalUtilDistChart').getContext('2d');
  DashboardState.charts.modalUtilDist = new Chart(utilCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(utilRanges),
      datasets: [{
        label: 'Workers',
        data: Object.values(utilRanges),
        backgroundColor: ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' Workers';
            }
          }
        }
      },
      scales: {
        x: { 
          title: { display: true, text: 'Utilization Rate (%)' }
        },
        y: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Number of Workers' }
        }
      }
    }
  });
  
  // Efficiency chart
  const effCtx = document.getElementById('modalEffDistChart').getContext('2d');
  DashboardState.charts.modalEffDist = new Chart(effCtx, {
    type: 'bar',
    data: {
      labels: Object.keys(effRanges),
      datasets: [{
        label: 'Workers',
        data: Object.values(effRanges),
        backgroundColor: ['#dc2626', '#ea580c', '#ca8a04', '#65a30d', '#16a34a', '#7c3aed']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y + ' Workers';
            }
          }
        }
      },
      scales: {
        x: { 
          title: { display: true, text: 'Efficiency Rate (%)' }
        },
        y: { 
          beginAtZero: true, 
          ticks: { stepSize: 1 },
          title: { display: true, text: 'Number of Workers' }
        }
      }
    }
  });
}

function generateProcessBreakdown(data) {
  const processes = {};
  
  data.forEach(r => {
    const proc = r.foDesc2 || 'Unknown';
    if (!processes[proc]) processes[proc] = { count: 0, util: 0, eff: 0, workers: [] };
    processes[proc].count++;
    processes[proc].util += r.utilizationRate || 0;
    processes[proc].eff += r.efficiencyRate || 0;
    processes[proc].workers.push(r);
  });
  
  const html = Object.keys(processes)
    .sort((a, b) => processes[b].count - processes[a].count)
    .map(proc => {
      const p = processes[proc];
      const avgUtil = p.count > 0 ? p.util / p.count : 0;
      const avgEff = p.count > 0 ? p.eff / p.count : 0;
      return `
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-blue-200 cursor-pointer hover:shadow-md hover:border-blue-400 transition-all" onclick="openProcessDetailModal('${proc.replace(/'/g, "\\'")}')">
          <p class="text-sm font-bold text-gray-800 mb-2 truncate" title="${proc}">${proc}</p>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-600">Workers</span>
            <span class="text-base font-bold text-blue-700">${p.count}</span>
          </div>
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-600">Avg Util</span>
            <span class="text-base font-bold text-blue-900">${avgUtil.toFixed(1)}%</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-600">Avg Eff</span>
            <span class="text-base font-bold text-purple-900">${avgEff.toFixed(1)}%</span>
          </div>
        </div>
      `;
    }).join('');
  
  document.getElementById('modalProcessBreakdown').innerHTML = html;
}

// New function: Open Process Detail Modal (2nd level) with sorting support
let ProcessModalState = {
  data: [],
  sort: { column: 'utilization', direction: 'desc' }
};

function openProcessDetailModal(processName) {
  const filtered = ModalState.currentData.filter(r => r.foDesc2 === processName);
  
  if (filtered.length === 0) {
    alert('No data for this process');
    return;
  }
  
  // Store data for sorting
  ProcessModalState.data = filtered;
  ProcessModalState.sort = { column: 'utilization', direction: 'desc' };
  
  // Calculate summary
  const workers = new Set(filtered.map(r => r.workerName)).size;
  const avgUtil = filtered.reduce((sum, r) => sum + (r.utilizationRate || 0), 0) / filtered.length;
  const avgEff = filtered.reduce((sum, r) => sum + (r.efficiencyRate || 0), 0) / filtered.length;
  const totalRecords = filtered.reduce((sum, r) => sum + r.recordCount, 0);
  
  // Build modal HTML
  const modalHtml = `
    <div class="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center" onclick="closeProcessDetailModal()">
      <div class="bg-white rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-hidden" onclick="event.stopPropagation()">
        <div class="bg-gradient-to-r from-gray-700 to-gray-800 p-5 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xl font-bold">${processName}</h3>
              <p class="text-sm mt-1 opacity-90">${workers} workers • ${totalRecords.toLocaleString()} records</p>
            </div>
            <button onclick="closeProcessDetailModal()" class="text-white hover:text-gray-200 transition">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 120px);">
          <!-- Summary Cards -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p class="text-xs text-gray-600 mb-1">Workers</p>
              <p class="text-2xl font-bold text-gray-700">${workers}</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p class="text-xs text-gray-600 mb-1">Avg Utilization</p>
              <p class="text-2xl font-bold text-gray-700">${avgUtil.toFixed(1)}%</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p class="text-xs text-gray-600 mb-1">Avg Efficiency</p>
              <p class="text-2xl font-bold text-gray-700">${avgEff.toFixed(1)}%</p>
            </div>
          </div>
          
          <!-- Workers Table with Sorting -->
          <div class="bg-white rounded-lg border border-gray-200">
            <div class="p-3 bg-gray-50 border-b border-gray-200">
              <h4 class="font-bold text-gray-800 text-sm">Worker Details</h4>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-3 py-2 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onclick="sortProcessModal('worker')">
                      Worker <i class="fas fa-sort text-xs ml-1"></i>
                    </th>
                    <th class="px-3 py-2 text-center text-xs font-semibold text-gray-700">Shift</th>
                    <th class="px-3 py-2 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onclick="sortProcessModal('utilization')">
                      Utilization <i class="fas fa-sort text-xs ml-1"></i>
                    </th>
                    <th class="px-3 py-2 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onclick="sortProcessModal('efficiency')">
                      Efficiency <i class="fas fa-sort text-xs ml-1"></i>
                    </th>
                    <th class="px-3 py-2 text-right text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100" onclick="sortProcessModal('records')">
                      Records <i class="fas fa-sort text-xs ml-1"></i>
                    </th>
                  </tr>
                </thead>
                <tbody id="processModalTableBody" class="divide-y divide-gray-200">
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Insert modal
  const modalContainer = document.createElement('div');
  modalContainer.id = 'processDetailModal';
  modalContainer.innerHTML = modalHtml;
  document.body.appendChild(modalContainer);
  
  // Render table with initial sort
  renderProcessModalTable();
}

function sortProcessModal(column) {
  // Toggle direction if same column
  if (ProcessModalState.sort.column === column) {
    ProcessModalState.sort.direction = ProcessModalState.sort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    ProcessModalState.sort.column = column;
    ProcessModalState.sort.direction = 'desc';
  }
  
  renderProcessModalTable();
}

function renderProcessModalTable() {
  const tbody = document.getElementById('processModalTableBody');
  if (!tbody) return;
  
  const { data, sort } = ProcessModalState;
  
  // Sort data
  const sorted = [...data].sort((a, b) => {
    let valA, valB;
    
    switch (sort.column) {
      case 'worker':
        valA = a.workerName || '';
        valB = b.workerName || '';
        break;
      case 'utilization':
        valA = a.utilizationRate || 0;
        valB = b.utilizationRate || 0;
        break;
      case 'efficiency':
        valA = a.efficiencyRate || 0;
        valB = b.efficiencyRate || 0;
        break;
      case 'records':
        valA = a.recordCount || 0;
        valB = b.recordCount || 0;
        break;
      default:
        valA = a.utilizationRate || 0;
        valB = b.utilizationRate || 0;
    }
    
    if (typeof valA === 'string') {
      return sort.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    } else {
      return sort.direction === 'asc' ? valA - valB : valB - valA;
    }
  });
  
  // Render rows
  tbody.innerHTML = sorted.map(r => `
    <tr class="hover:bg-gray-50">
      <td class="px-3 py-2 text-sm text-gray-900">${r.workerName}</td>
      <td class="px-3 py-2 text-sm text-center">
        <span class="px-2 py-1 rounded text-xs ${r.workingShift === 'Day' ? 'bg-yellow-100 text-yellow-800' : r.workingShift === 'Night' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}">
          ${r.workingShift || '-'}
        </span>
      </td>
      <td class="px-3 py-2 text-sm text-right">
        <span class="font-semibold ${r.utilizationRate >= 70 ? 'text-green-700' : r.utilizationRate >= 50 ? 'text-yellow-700' : 'text-red-700'}">
          ${r.utilizationRate.toFixed(1)}%
        </span>
      </td>
      <td class="px-3 py-2 text-sm text-right">
        <span class="font-semibold ${r.efficiencyRate >= 70 ? 'text-green-700' : r.efficiencyRate >= 50 ? 'text-yellow-700' : 'text-red-700'}">
          ${r.efficiencyRate.toFixed(1)}%
        </span>
      </td>
      <td class="px-3 py-2 text-sm text-right text-gray-600">${r.recordCount || 0}</td>
    </tr>
  `).join('');
}

function closeProcessDetailModal() {
  const modal = document.getElementById('processDetailModal');
  if (modal) modal.remove();
}

// AI Insight Modal functions
function openAIInsightModal() {
  const modal = document.getElementById('aiInsightModal');
  if (!modal) return;
  
  // Use Dashboard aggregated data instead of Report data
  const aggregated = AppState.aggregatedData || [];
  
  if (aggregated.length === 0) {
    alert('No data available for AI analysis. Please upload an Excel file first.');
    return;
  }
  
  // Group by worker to calculate metrics
  const workerMap = {};
  aggregated.forEach(r => {
    const name = r.workerName;
    if (!workerMap[name]) {
      workerMap[name] = {
        workerName: name,
        totalUtil: 0,
        totalEff: 0,
        count: 0
      };
    }
    workerMap[name].totalUtil += r.utilizationRate || 0;
    workerMap[name].totalEff += r.efficiencyRate || 0;
    workerMap[name].count++;
  });
  
  const workers = Object.values(workerMap).map(w => ({
    workerName: w.workerName,
    utilizationRate: w.totalUtil / w.count,
    efficiencyRate: w.totalEff / w.count
  }));
  
  const isEfficiency = AppState.currentMetricType === 'efficiency';
  
  // Calculate statistics
  const metric = isEfficiency ? 'efficiencyRate' : 'utilizationRate';
  const rates = workers.map(w => w[metric] || 0);
  const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
  
  const topPerformers = workers.filter(w => (w[metric] || 0) >= (isEfficiency ? 100 : 80));
  const atRiskWorkers = workers.filter(w => (w[metric] || 0) < (isEfficiency ? 60 : 30));
  
  // Update summary cards
  document.getElementById('aiTopPerformersCount').textContent = topPerformers.length;
  document.getElementById('aiAtRiskCount').textContent = atRiskWorkers.length;
  document.getElementById('aiAvgPerformance').textContent = avgRate.toFixed(1) + '%';
  
  // Generate Key Findings
  const keyFindings = [];
  
  if (topPerformers.length > 0) {
    keyFindings.push(`<li class="flex items-start gap-2">
      <i class="fas fa-check-circle text-green-500 mt-1"></i>
      <span><strong>${topPerformers.length} workers</strong> are performing excellently with ${isEfficiency ? '≥100%' : '≥80%'} ${isEfficiency ? 'efficiency' : 'utilization'} rate.</span>
    </li>`);
  }
  
  if (atRiskWorkers.length > 0) {
    keyFindings.push(`<li class="flex items-start gap-2">
      <i class="fas fa-exclamation-circle text-orange-500 mt-1"></i>
      <span><strong>${atRiskWorkers.length} workers</strong> need attention with ${isEfficiency ? '<60%' : '<30%'} ${isEfficiency ? 'efficiency' : 'utilization'} rate.</span>
    </li>`);
  }
  
  keyFindings.push(`<li class="flex items-start gap-2">
    <i class="fas fa-chart-bar text-blue-500 mt-1"></i>
    <span>Average ${isEfficiency ? 'efficiency' : 'utilization'} rate across all workers is <strong>${avgRate.toFixed(1)}%</strong>.</span>
  </li>`);
  
  // Find best and worst performers
  const sorted = [...workers].sort((a, b) => (b[metric] || 0) - (a[metric] || 0));
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  
  keyFindings.push(`<li class="flex items-start gap-2">
    <i class="fas fa-star text-purple-500 mt-1"></i>
    <span>Best performer: <strong>${best.workerName}</strong> (${(best[metric] || 0).toFixed(1)}%)</span>
  </li>`);
  
  keyFindings.push(`<li class="flex items-start gap-2">
    <i class="fas fa-flag text-red-500 mt-1"></i>
    <span>Needs most support: <strong>${worst.workerName}</strong> (${(worst[metric] || 0).toFixed(1)}%)</span>
  </li>`);
  
  document.getElementById('aiKeyFindings').innerHTML = keyFindings.join('');
  
  // Generate Anomalies
  const anomalies = [];
  
  // Check for outliers (>2 standard deviations)
  const mean = avgRate;
  const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
  const stdDev = Math.sqrt(variance);
  const outliers = workers.filter(w => Math.abs((w[metric] || 0) - mean) > 2 * stdDev);
  
  if (outliers.length > 0) {
    anomalies.push(`<li class="flex items-start gap-2">
      <i class="fas fa-bolt text-orange-500 mt-1"></i>
      <span><strong>${outliers.length} workers</strong> show performance significantly different from the average (>2σ deviation).</span>
    </li>`);
  }
  
  // Check for process-specific issues
  const processes = {};
  workers.forEach(w => {
    const proc = w.foDesc2 || 'Unknown';
    if (!processes[proc]) processes[proc] = [];
    processes[proc].push(w[metric] || 0);
  });
  
  const processAvgs = Object.entries(processes).map(([name, rates]) => ({
    name,
    avg: rates.reduce((sum, r) => sum + r, 0) / rates.length,
    count: rates.length
  }));
  
  const sortedProcs = processAvgs.sort((a, b) => a.avg - b.avg);
  if (sortedProcs.length > 0) {
    const lowest = sortedProcs[0];
    if (lowest.count >= 3 && lowest.avg < avgRate * 0.7) {
      anomalies.push(`<li class="flex items-start gap-2">
        <i class="fas fa-exclamation-triangle text-red-500 mt-1"></i>
        <span>Process <strong>${lowest.name}</strong> shows consistently low performance (${lowest.avg.toFixed(1)}% avg).</span>
      </li>`);
    }
  }
  
  if (anomalies.length === 0) {
    anomalies.push(`<li class="flex items-start gap-2">
      <i class="fas fa-check-circle text-green-500 mt-1"></i>
      <span>No significant performance anomalies detected. All workers are within expected ranges.</span>
    </li>`);
  }
  
  document.getElementById('aiAnomalies').innerHTML = anomalies.join('');
  
  // Generate Recommendations
  const recommendations = [];
  
  if (atRiskWorkers.length > 0) {
    recommendations.push(`<li class="flex items-start gap-2">
      <i class="fas fa-arrow-right text-green-500 mt-1"></i>
      <span>Provide additional training or support for <strong>${atRiskWorkers.length} at-risk workers</strong> to improve their ${isEfficiency ? 'efficiency' : 'utilization'} rates.</span>
    </li>`);
  }
  
  if (topPerformers.length > 0) {
    recommendations.push(`<li class="flex items-start gap-2">
      <i class="fas fa-arrow-right text-green-500 mt-1"></i>
      <span>Analyze best practices from top ${topPerformers.length} performers and share knowledge across the team.</span>
    </li>`);
  }
  
  if (sortedProcs.length > 1) {
    const highest = sortedProcs[sortedProcs.length - 1];
    const lowest = sortedProcs[0];
    recommendations.push(`<li class="flex items-start gap-2">
      <i class="fas fa-arrow-right text-green-500 mt-1"></i>
      <span>Compare processes: <strong>${highest.name}</strong> (${highest.avg.toFixed(1)}%) vs <strong>${lowest.name}</strong> (${lowest.avg.toFixed(1)}%) to identify improvement opportunities.</span>
    </li>`);
  }
  
  recommendations.push(`<li class="flex items-start gap-2">
    <i class="fas fa-arrow-right text-green-500 mt-1"></i>
    <span>Consider implementing peer mentoring programs pairing high and low performers.</span>
  </li>`);
  
  recommendations.push(`<li class="flex items-start gap-2">
    <i class="fas fa-arrow-right text-green-500 mt-1"></i>
    <span>Monitor trends weekly using the KPI Trend Intelligence chart to detect early warning signs.</span>
  </li>`);
  
  document.getElementById('aiRecommendations').innerHTML = recommendations.join('');
  
  // Show modal
  modal.classList.remove('hidden');
}

function closeAIInsightModal() {
  const modal = document.getElementById('aiInsightModal');
  if (modal) modal.classList.add('hidden');
}

// Glossary Modal functions
function openGlossaryModal() {
  const modal = document.getElementById('glossaryModal');
  if (modal) modal.classList.remove('hidden');
}

function closeGlossaryModal() {
  const modal = document.getElementById('glossaryModal');
  if (modal) modal.classList.add('hidden');
}

function generateTopBottomPerformers(data) {
  // Sort by combined score (utilization + efficiency)
  const sorted = [...data].sort((a, b) => {
    const scoreA = (a.utilizationRate || 0) + (a.efficiencyRate || 0);
    const scoreB = (b.utilizationRate || 0) + (b.efficiencyRate || 0);
    return scoreB - scoreA;
  });
  
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();
  
  const topHtml = top3.map((r, i) => `
    <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-300">
      <div class="flex items-center gap-2">
        <span class="w-6 h-6 rounded-full bg-gray-700 text-white text-xs flex items-center justify-center font-bold">${i+1}</span>
        <div>
          <p class="text-sm font-medium text-gray-900">${r.workerName}</p>
          <p class="text-xs text-gray-500">${r.foDesc2 || '-'}</p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-700 font-semibold">U: ${r.utilizationRate.toFixed(1)}%</p>
        <p class="text-xs text-gray-700 font-semibold">E: ${r.efficiencyRate.toFixed(1)}%</p>
      </div>
    </div>
  `).join('');
  
  const bottomHtml = bottom3.map(r => `
    <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-300">
      <div>
        <p class="text-sm font-medium text-gray-900">${r.workerName}</p>
        <p class="text-xs text-gray-500">${r.foDesc2 || '-'}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-gray-700 font-semibold">U: ${r.utilizationRate.toFixed(1)}%</p>
        <p class="text-xs text-gray-700 font-semibold">E: ${r.efficiencyRate.toFixed(1)}%</p>
      </div>
    </div>
  `).join('');
  
  document.getElementById('modalTopPerformers').innerHTML = topHtml;
  document.getElementById('modalBottomPerformers').innerHTML = bottomHtml;
}

function renderModalTable(data) {
  const tbody = document.getElementById('modalTableBody');
  
  // Apply current sort
  const sorted = [...data].sort((a, b) => {
    let valA, valB;
    switch (ModalState.currentSort.column) {
      case 'worker':
        valA = a.workerName || '';
        valB = b.workerName || '';
        break;
      case 'process':
        valA = a.foDesc2 || '';
        valB = b.foDesc2 || '';
        break;
      case 'utilization':
        valA = a.utilizationRate || 0;
        valB = b.utilizationRate || 0;
        break;
      case 'efficiency':
        valA = a.efficiencyRate || 0;
        valB = b.efficiencyRate || 0;
        break;
      case 'records':
        valA = a.recordCount || 0;
        valB = b.recordCount || 0;
        break;
      default:
        valA = a.utilizationRate || 0;
        valB = b.utilizationRate || 0;
    }
    
    if (typeof valA === 'string') {
      return ModalState.currentSort.direction === 'asc' 
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return ModalState.currentSort.direction === 'asc' 
        ? valA - valB
        : valB - valA;
    }
  });
  
  tbody.innerHTML = sorted.map(r => {
    const shiftTime = (r.shiftCount || 1) * 660;
    const workTime = r.totalActualMins || 0;
    const adjustedST = r.totalStandardTime || 0;
    
    return `
      <tr class="hover:bg-gray-50 transition">
        <td class="px-4 py-3 text-sm font-medium text-gray-900">${r.workerName}</td>
        <td class="px-4 py-3 text-sm text-gray-600">${r.foDesc2 || '-'}</td>
        <td class="px-4 py-3 text-sm text-center">
          <span class="px-2 py-1 rounded text-xs ${r.workingShift === 'Day' ? 'bg-yellow-100 text-yellow-800' : 'bg-indigo-100 text-indigo-800'}">
            ${r.workingShift || '-'}
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-right">
          <span class="px-2 py-1 rounded font-semibold ${r.utilizationRate >= 70 ? 'bg-green-100 text-green-800' : r.utilizationRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
            ${r.utilizationRate.toFixed(1)}%
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-right">
          <span class="px-2 py-1 rounded font-semibold ${r.efficiencyRate >= 70 ? 'bg-green-100 text-green-800' : r.efficiencyRate >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}">
            ${r.efficiencyRate.toFixed(1)}%
          </span>
        </td>
        <td class="px-4 py-3 text-sm text-right text-gray-600">${formatMinutes(shiftTime)}</td>
        <td class="px-4 py-3 text-sm text-right text-gray-600">${formatMinutes(workTime)}</td>
        <td class="px-4 py-3 text-sm text-right text-gray-600">${formatMinutes(adjustedST)}</td>
        <td class="px-4 py-3 text-sm text-right text-gray-600">${r.recordCount || 0}</td>
      </tr>
    `;
  }).join('');
  
  document.getElementById('modalTableCount').textContent = `${sorted.length} workers`;
}

function sortModalTable(column) {
  if (ModalState.currentSort.column === column) {
    ModalState.currentSort.direction = ModalState.currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    ModalState.currentSort.column = column;
    ModalState.currentSort.direction = 'desc';
  }
  
  filterModalTable(); // Re-render with new sort
}

function filterModalTable() {
  const searchTerm = document.getElementById('modalSearchInput').value.toLowerCase();
  const processFilter = document.getElementById('modalProcessFilter').value;
  const shiftFilter = document.getElementById('modalShiftFilter').value;
  
  let filtered = ModalState.currentData.filter(r => {
    const matchesSearch = !searchTerm || 
      (r.workerName && r.workerName.toLowerCase().includes(searchTerm)) ||
      (r.foDesc2 && r.foDesc2.toLowerCase().includes(searchTerm));
    
    const matchesProcess = processFilter === 'all' || r.foDesc2 === processFilter;
    const matchesShift = shiftFilter === 'all' || r.workingShift === shiftFilter;
    
    return matchesSearch && matchesProcess && matchesShift;
  });
  
  renderModalTable(filtered);
}

function resetModalFilters() {
  document.getElementById('modalSearchInput').value = '';
  document.getElementById('modalProcessFilter').value = 'all';
  document.getElementById('modalShiftFilter').value = 'all';
  ModalState.currentSort = { column: 'utilization', direction: 'desc' };
  renderModalTable(ModalState.currentData);
}

function formatMinutes(mins) {
  if (mins < 60) return `${Math.round(mins)}m`;
  const hours = Math.floor(mins / 60);
  const remainingMins = Math.round(mins % 60);
  return `${hours}h ${remainingMins}m`;
}

function closePeriodModal() {
  document.getElementById('periodDetailModal').classList.add('hidden');
}

// ========== Utility Functions ==========
function toggleOutlierScanner() {
  const scanner = document.getElementById('outlierScanner');
  scanner.classList.toggle('hidden');
}

function filterDashboardByKPI(kpi) {
  DashboardState.currentKPI = kpi;
  // TODO: Filter all charts by selected KPI
  console.log(`Filtered by KPI: ${kpi}`);
}

// ========== Initialization ==========
function initExecutiveDashboard() {
  console.log(' Executive Dashboard initialized');
  
  // Populate hierarchy dropdown
  if (AppState.processedData && AppState.processedData.length > 0) {
    const hierarchies = [...new Set(AppState.processedData.map(r => r.foDesc2).filter(Boolean))].sort();
    const select = document.getElementById('trendHierarchy');
    select.innerHTML = '<option value="all">All Processes</option>' + 
      hierarchies.map(h => `<option value="${h}">${h}</option>`).join('');
  }
}

console.log(' Executive Dashboard functions loaded');

// Hook: Call Executive Dashboard refresh when tab is shown
(function() {
  const originalShowTab = window.showTab || function(){};
  window.showTab = function(tabName) {
    originalShowTab(tabName);
    if (tabName === 'dashboard' && AppState.processedData && AppState.processedData.length > 0) {
      setTimeout(() => {
        refreshExecutiveDashboard();
        initExecutiveDashboard();
      }, 100);
    }
  };
})();
