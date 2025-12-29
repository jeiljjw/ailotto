/**
 * 로또 분석 웹 애플리케이션 메인 JavaScript
 * UI 제어 및 이벤트 핸들링
 */

class LottoWebApp {
    constructor() {
        this.analyzer = new LottoAnalyzer();
        this.chartManager = new LottoChart();
        this.currentData = null;
        this.currentTab = 'overview';
        
        this.init();
    }

    /**
     * 애플리케이션 초기화
     */
    init() {
        this.setupEventListeners();
        this.setupTabNavigation();
        // 페이지 로드 시 자동으로 데이터 로드
        this.loadHistoryData();
    }

    /**
     * 이벤트 리스너 설정 (데이터 로드 관련 제거)
     */
    setupEventListeners() {
        // 분석 버튼들
        document.getElementById('analyzeFrequency').addEventListener('click', () => {
            this.analyzeFrequency();
        });

        document.getElementById('analyzePattern').addEventListener('click', () => {
            this.analyzePattern();
        });

        document.getElementById('analyzeCycle').addEventListener('click', () => {
            this.analyzeCycle();
        });

        // 추천 버튼
        document.getElementById('generateRecommendations').addEventListener('click', () => {
            this.generateRecommendations();
        });

        // 차트 버튼들
        document.getElementById('showFrequencyChart').addEventListener('click', () => {
            this.showFrequencyChart();
        });

        document.getElementById('showCycleChart').addEventListener('click', () => {
            this.showCycleChart();
        });

        document.getElementById('showPatternChart').addEventListener('click', () => {
            this.showPatternChart();
        });
    }

    /**
     * 탭 네비게이션 설정
     */
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });
    }

    /**
     * 탭 전환
     * @param {string} tabId - 탭 ID
     */
    switchTab(tabId) {
        // 탭 버튼 상태 업데이트
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

        // 탭 콘텐츠 업데이트
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');

        this.currentTab = tabId;

        // 탭별 초기화
        if (tabId === 'visualization' && this.currentData) {
            this.showFrequencyChart();
        }
    }



    /**
     * 파일 로드
     * @param {File} file - 업로드된 파일
     */
    loadFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.processData(data, '파일에서 데이터 로드 완료');
            } catch (error) {
                this.showStatus('error', '파일 형식이 올바르지 않습니다. JSON 파일을 선택해주세요.');
            }
        };
        
        reader.readAsText(file);
    }

    /**
     * 기존 데이터 로드 (lotto_history.json)
     */
    async loadHistoryData() {
        this.showLoading(true);
        
        try {
            // 기본적으로 데모 데이터 로드
            let data = this.generateDemoData();
            
            // lotto_history.json이 있으면 그것을 덮어쓰기
            try {
                const response = await fetch('lotto_history.json');
                if (response.ok) {
                    const realData = await response.json();
                    if (Array.isArray(realData) && realData.length > 0) {
                        data = realData;
                        this.showStatus('success', '실제 데이터로 업데이트되었습니다.');
                    }
                }
            } catch (fetchError) {
                console.log('lotto_history.json을 찾을 수 없어 데모 데이터를 사용합니다.');
            }
            
            this.processData(data, '데이터 로드 완료');
        } catch (error) {
            console.error('데이터 로드 오류:', error);
            // 오류 시에도 데모 데이터 사용
            const demoData = this.generateDemoData();
            this.processData(demoData, '데모 데이터로 로드되었습니다.');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 데모 데이터 로드 (백업용)
     */
    loadDemoData() {
        const demoData = this.generateDemoData();
        this.processData(demoData, '데모 데이터를 로드했습니다.');
    }

    /**
     * 데모 데이터 생성
     */
    generateDemoData() {
        const data = [];
        const startDate = new Date('2023-01-01');
        
        for (let i = 1; i <= 100; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + (i - 1) * 7); // 주마다
            
            const numbers = this.generateRandomNumbers();
            
            data.push({
                draw_no: i,
                draw_date: date.toISOString().split('T')[0],
                num1: numbers[0],
                num2: numbers[1],
                num3: numbers[2],
                num4: numbers[3],
                num5: numbers[4],
                num6: numbers[5],
                bonus: Math.floor(Math.random() * 45) + 1
            });
        }
        
        return data;
    }

    /**
     * 랜덤 번호 생성
     */
    generateRandomNumbers() {
        const numbers = [];
        while (numbers.length < 6) {
            const num = Math.floor(Math.random() * 45) + 1;
            if (!numbers.includes(num)) {
                numbers.push(num);
            }
        }
        return numbers.sort((a, b) => a - b);
    }

    /**
     * 번호 색상 클래스 반환
     * @param {number} number - 로또 번호
     */
    getNumberColorClass(number) {
        if (number >= 1 && number <= 9) return 'digit-1';
        if (number >= 10 && number <= 19) return 'digit-2';
        if (number >= 20 && number <= 29) return 'digit-3';
        if (number >= 30 && number <= 39) return 'digit-4';
        if (number >= 40 && number <= 45) return 'digit-5';
        return '';
    }
    processData(data, message) {
        if (!Array.isArray(data) || data.length === 0) {
            this.showStatus('error', '유효한 데이터가 없습니다.');
            return;
        }

        this.currentData = data;
        this.analyzer.loadData(data);
        this.showStatus('success', `${message} (${data.length}회차)`);
        this.updateOverview();
    }

    /**
     * 개요 업데이트
     */
    updateOverview() {
        const summary = this.analyzer.getDataSummary();
        const overviewContent = document.getElementById('overviewContent');
        
        if (!summary) {
            overviewContent.innerHTML = '<p>데이터를 로드할 수 없습니다.</p>';
            return;
        }

        // 마지막 회차 정보
        const latestDraw = this.currentData[this.currentData.length - 1];
        
        // 통계 카드 생성
        overviewContent.innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${summary.totalDraws}</div>
                    <div class="stat-label">총 회차</div>
                           
                </div>
                <div class="stat-card">
                    <div class="stat-value">${summary.endDate}</div>
                    <div class="stat-label">마지막 회차</div>
                </div>
             
            </div>
            
            <div style="margin-top: 30px;">
                <h3>📅 최신 당첨번호</h3>
                <div style="background: white; border-radius: 12px; padding: 20px; margin: 15px 0; border: 2px solid var(--primary-color);">
                    <h4 style="color: var(--primary-color); margin-bottom: 15px;">
                        ${latestDraw.draw_no}회 (${latestDraw.draw_date})
                    </h4>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">
                        <span class="number-ball ${this.getNumberColorClass(latestDraw.num1)}">${latestDraw.num1}</span>
                        <span class="number-ball ${this.getNumberColorClass(latestDraw.num2)}">${latestDraw.num2}</span>
                        <span class="number-ball ${this.getNumberColorClass(latestDraw.num3)}">${latestDraw.num3}</span>
                        <span class="number-ball ${this.getNumberColorClass(latestDraw.num4)}">${latestDraw.num4}</span>
                        <span class="number-ball ${this.getNumberColorClass(latestDraw.num5)}">${latestDraw.num5}</span>
                        <span class="number-ball ${this.getNumberColorClass(latestDraw.num6)}">${latestDraw.num6}</span>
                        <span style="margin: 0 10px; font-size: 1.2rem;">+</span>
                        <span class="number-ball ${this.getNumberColorClass(latestDraw.bonus)}">${latestDraw.bonus}</span>
                    </div>
                </div>
                
                <p style="margin-top: 20px;">데이터가 성공적으로 로드되었습니다. 이제 다양한 분석을 수행할 수 있습니다.</p>
                
            </div>
        `;
    }

    /**
     * 빈도 분석 실행
     */
    analyzeFrequency() {
        if (!this.currentData) {
            this.showStatus('error', '데이터를 먼저 로드해주세요.');
            return;
        }

        this.showLoading(true);
        
        setTimeout(() => {
            try {
                const result = this.analyzer.frequencyAnalysis();
                this.displayFrequencyResult(result);
                this.showStatus('success', '빈도 분석이 완료되었습니다.');
            } catch (error) {
                this.showStatus('error', `빈도 분석 오류: ${error.message}`);
            } finally {
                this.showLoading(false);
            }
        }, 500);
    }

    /**
     * 빈도 분석 결과 표시
     * @param {Object} result - 분석 결과
     */
    displayFrequencyResult(result) {
        const container = document.getElementById('frequencyResult');
        
        let html = `
            <h3>🔥 Hot Numbers (가장 많이 나온 번호 TOP 10)</h3>
            <div class="number-list">
        `;
        
        result.hotNumbers.forEach(([num, count], index) => {
            const percentage = (count / result.totalDraws * 100).toFixed(1);
            const colorClass = this.getNumberColorClass(parseInt(num));
            html += `
                <div class="number-item rank-${index + 1}">
                    <span class="number-ball ${colorClass}">${num}</span>
                    <span>${count}회 출현 (${percentage}%)</span>
                </div>
            `;
        });
        
        html += `
            </div>
            <h3>❄️ Cold Numbers (가장 적게 나온 번호 TOP 10)</h3>
            <div class="number-list">
        `;
        
        result.coldNumbers.forEach(([num, count], index) => {
            const percentage = (count / result.totalDraws * 100).toFixed(1);
            const colorClass = this.getNumberColorClass(parseInt(num));
            html += `
                <div class="number-item rank-${index + 1}">
                    <span class="number-ball ${colorClass}">${num}</span>
                    <span>${count}회 출현 (${percentage}%)</span>
                </div>
            `;
        });
        
        html += `
            </div>
            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <p><strong>📊 통계 정보:</strong></p>
                <p>• 총 ${result.totalDraws}회차 데이터</p>
                <p>• 이론적 기대 출현 횟수: ${result.expectedFrequency.toFixed(1)}회</p>
                <p>• 실제 최대 출현 횟수: ${result.hotNumbers[0][1]}회</p>
                <p>• 실제 최소 출현 횟수: ${result.coldNumbers[0][1]}회</p>
            </div>
        `;
        
        container.innerHTML = html;
    }

    /**
     * 패턴 분석 실행
     */
    analyzePattern() {
        if (!this.currentData) {
            this.showStatus('error', '데이터를 먼저 로드해주세요.');
            return;
        }

        this.showLoading(true);
        
        setTimeout(() => {
            try {
                const result = this.analyzer.patternAnalysis();
                this.displayPatternResult(result);
                this.showStatus('success', '패턴 분석이 완료되었습니다.');
            } catch (error) {
                this.showStatus('error', `패턴 분석 오류: ${error.message}`);
            } finally {
                this.showLoading(false);
            }
        }, 500);
    }

    /**
     * 패턴 분석 결과 표시
     * @param {Object} result - 분석 결과
     */
    displayPatternResult(result) {
        const container = document.getElementById('patternResult');
        
        let html = `
            <h3>🎲 홀짝 패턴 분포</h3>
            <table class="number-table">
                <thead>
                    <tr>
                        <th>홀수:짝수 비율</th>
                        <th>출현 횟수</th>
                        <th>비율</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        result.oddEven.forEach(([pattern, count]) => {
            const percentage = (count / result.totalDraws * 100).toFixed(1);
            html += `
                <tr>
                    <td>${pattern}</td>
                    <td>${count}회</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
            
            <h3 style="margin-top: 30px;">📊 고저 패턴 분포</h3>
            <table class="number-table">
                <thead>
                    <tr>
                        <th>저번호:고번호 비율</th>
                        <th>출현 횟수</th>
                        <th>비율</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        result.highLow.forEach(([pattern, count]) => {
            const percentage = (count / result.totalDraws * 100).toFixed(1);
            html += `
                <tr>
                    <td>${pattern}</td>
                    <td>${count}회</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    }

    /**
     * 주기 분석 실행
     */
    analyzeCycle() {
        if (!this.currentData) {
            this.showStatus('error', '데이터를 먼저 로드해주세요.');
            return;
        }

        this.showLoading(true);
        
        setTimeout(() => {
            try {
                const result = this.analyzer.cycleAnalysis();
                this.displayCycleResult(result);
                this.showStatus('success', '주기 분석이 완료되었습니다.');
            } catch (error) {
                this.showStatus('error', `주기 분석 오류: ${error.message}`);
            } finally {
                this.showLoading(false);
            }
        }, 500);
    }

    /**
     * 주기 분석 결과 표시
     * @param {Object} result - 분석 결과
     */
    displayCycleResult(result) {
        const container = document.getElementById('cycleResult');
        
        let html = `
            <h3>⏱️ 평균 출현 주기가 짧은 번호 (자주 출현)</h3>
            <div class="number-list">
        `;
        
        result.topFrequent.forEach(([num, cycle], index) => {
            const colorClass = this.getNumberColorClass(parseInt(num));
            html += `
                <div class="number-item">
                    <span class="number-ball ${colorClass}">${num}</span>
                    <span>평균 ${cycle.toFixed(1)}회차마다 출현</span>
                </div>
            `;
        });
        
        html += `
            </div>
            
            <h3>⚠️ 가장 오래 미출현 번호 TOP 10</h3>
            <div class="number-list">
        `;
        
        result.topGap.forEach(([num, gap], index) => {
            const avg = result.averageCycles[num] || 0;
            const status = gap > avg * 1.5 ? '⚡ 출현 예상' : '';
            const colorClass = this.getNumberColorClass(parseInt(num));
            html += `
                <div class="number-item">
                    <span class="number-ball ${colorClass}">${num}</span>
                    <span>${gap}회차 미출현 (평균주기: ${avg.toFixed(1)}) ${status}</span>
                </div>
            `;
        });
        
        html += `
            </div>
        `;
        
        container.innerHTML = html;
    }

    /**
     * 번호 추천 생성
     */
    generateRecommendations() {
        if (!this.currentData) {
            this.showStatus('error', '데이터를 먼저 로드해주세요.');
            return;
        }

        this.showLoading(true);
        
        setTimeout(() => {
            try {
                const numRecommendations = parseInt(document.getElementById('numRecommendations').value);
                const strategy = document.getElementById('strategy').value;
                
                const recommendations = this.analyzer.generateRecommendations({
                    numRecommendations,
                    strategy
                });
                
                this.displayRecommendations(recommendations);
                this.showStatus('success', '번호 추천이 완료되었습니다.');
            } catch (error) {
                this.showStatus('error', `번호 추천 오류: ${error.message}`);
            } finally {
                this.showLoading(false);
            }
        }, 500);
    }

    /**
     * 추천 번호 표시
     * @param {Array} recommendations - 추천 번호 배열
     */
    displayRecommendations(recommendations) {
        const container = document.getElementById('recommendationResult');
        
        let html = '';
        
        recommendations.forEach((rec, index) => {
            html += `
                <div class="recommendation-set">
                    <h4>${rec.name}</h4>
                    <div class="numbers">
            `;
            
            rec.numbers.forEach(num => {
                const colorClass = this.getNumberColorClass(num);
                html += `<span class="number-ball ${colorClass}">${num}</span>`;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    /**
     * 빈도 차트 표시
     */
    showFrequencyChart() {
        if (!this.currentData) {
            this.showStatus('error', '데이터를 먼저 로드해주세요.');
            return;
        }

        const result = this.analyzer.frequencyAnalysis();
        this.chartManager.createFrequencyChart(result);
    }

    /**
     * 주기 차트 표시
     */
    showCycleChart() {
        if (!this.currentData) {
            this.showStatus('error', '데이터를 먼저 로드해주세요.');
            return;
        }

        const result = this.analyzer.cycleAnalysis();
        this.chartManager.createCycleChart(result);
    }

    /**
     * 패턴 차트 표시
     */
    showPatternChart() {
        if (!this.currentData) {
            this.showStatus('error', '데이터를 먼저 로드해주세요.');
            return;
        }

        const result = this.analyzer.patternAnalysis();
        this.chartManager.createPatternChart(result);
    }

    /**
     * 상태 메시지 표시
     * @param {string} type - 메시지 타입 (success, error, info)
     * @param {string} message - 메시지 내용
     */
    showStatus(type, message) {
        const statusElement = document.getElementById('dataStatus');
        if (!statusElement) {
            // 요소가 없으면 콘솔에만 출력
            console.log(`[${type.toUpperCase()}] ${message}`);
            return;
        }
        
        statusElement.className = `status-message ${type}`;
        statusElement.textContent = message;
        
        // 5초 후 자동 제거
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'status-message';
        }, 5000);
    }

    /**
     * 로딩 오버레이 표시/숨김
     * @param {boolean} show - 표시 여부
     */
    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }
}

// Chart.js 라이브러리 로드 확인
document.addEventListener('DOMContentLoaded', function() {
    // Chart.js가 로드되지 않은 경우 경고
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js가 로드되지 않았습니다. 차트 기능이 제한될 수 있습니다.');
    }
});

// 애플리케이션 초기화
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new LottoWebApp();
});