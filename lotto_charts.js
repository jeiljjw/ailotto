/**
 * 로또 분석 차트 시각화 JavaScript 라이브러리
 * Chart.js를 사용하여 다양한 차트를 생성
 */

class LottoChart {
    constructor() {
        this.charts = {};
        this.colors = {
            primary: '#2563eb',
            secondary: '#64748b',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444',
            hot: '#ef4444',
            cold: '#10b981',
            balanced: '#f59e0b'
        };
    }

    /**
     * 빈도 차트 생성
     * @param {Object} frequencyData - 빈도 분석 데이터
     * @param {string} canvasId - Canvas 요소 ID
     */
    createFrequencyChart(frequencyData, canvasId = 'frequencyChart') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element with id '${canvasId}' not found`);
            return;
        }

        // 기존 차트 제거
        if (this.charts.frequency) {
            this.charts.frequency.destroy();
        }

        const labels = [];
        const data = [];
        const backgroundColors = [];

        // 상위 15개 번호만 표시
        for (let i = 0; i < Math.min(15, frequencyData.sorted.length); i++) {
            const [num, freq] = frequencyData.sorted[i];
            labels.push(`${num}번`);
            data.push(freq);
            
            // 색상 설정 (순위에 따라)
            if (i < 3) {
                backgroundColors.push(this.colors.danger); // 상위 3개는 빨간색
            } else if (i < 6) {
                backgroundColors.push(this.colors.warning); // 4-6위는 주황색
            } else {
                backgroundColors.push(this.colors.primary); // 나머지는 파란색
            }
        }

        this.charts.frequency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '출현 횟수',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + '80'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '번호별 출현 빈도 (TOP 15)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '출현 횟수'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '로또 번호'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        return this.charts.frequency;
    }

    /**
     * 주기관계 차트 생성
     * @param {Object} cycleData - 주기 분석 데이터
     * @param {string} canvasId - Canvas 요소 ID
     */
    createCycleChart(cycleData, canvasId = 'frequencyChart') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element with id '${canvasId}' not found`);
            return;
        }

        // 기존 차트 제거
        if (this.charts.cycle) {
            this.charts.cycle.destroy();
        }

        const labels = [];
        const avgCycleData = [];
        const currentGapData = [];

        // 상위 15개 번호 표시
        for (let i = 0; i < Math.min(15, cycleData.sortedByCycle.length); i++) {
            const [num, avgCycle] = cycleData.sortedByCycle[i];
            const currentGap = cycleData.currentGaps[num];
            
            labels.push(`${num}번`);
            avgCycleData.push(avgCycle);
            currentGapData.push(currentGap);
        }

        this.charts.cycle = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '평균 출현 주기',
                        data: avgCycleData,
                        borderColor: this.colors.primary,
                        backgroundColor: this.colors.primary + '20',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: '현재 미출현 기간',
                        data: currentGapData,
                        borderColor: this.colors.danger,
                        backgroundColor: this.colors.danger + '20',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '번호별 출현 주기 및 현재 미출현 기간',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '회차 수'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '로또 번호'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        return this.charts.cycle;
    }

    /**
     * 패턴 분포 차트 생성
     * @param {Object} patternData - 패턴 분석 데이터
     * @param {string} canvasId - Canvas 요소 ID
     */
    createPatternChart(patternData, canvasId = 'frequencyChart') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element with id '${canvasId}' not found`);
            return;
        }

        // 기존 차트 제거
        if (this.charts.pattern) {
            this.charts.pattern.destroy();
        }

        // 홀짝 패턴 데이터 준비
        const oddEvenLabels = patternData.oddEven.map(([pattern]) => {
            const [odd, even] = pattern.split(':').map(Number);
            return `홀수:${odd} / 짝수:${even}`;
        });
        const oddEvenData = patternData.oddEven.map(([, count]) => count);

        // 고저 패턴 데이터 준비
        const highLowLabels = patternData.highLow.map(([pattern]) => {
            const [low, high] = pattern.split(':').map(Number);
            return `저:${low} / 고:${high}`;
        });
        const highLowData = patternData.highLow.map(([, count]) => count);

        // 도넛 차트로 홀짝 패턴 표시
        this.charts.pattern = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: oddEvenLabels.slice(0, 8), // 상위 8개만 표시
                datasets: [{
                    data: oddEvenData.slice(0, 8),
                    backgroundColor: [
                        this.colors.primary,
                        this.colors.secondary,
                        this.colors.success,
                        this.colors.warning,
                        this.colors.danger,
                        this.colors.hot,
                        this.colors.cold,
                        this.colors.balanced
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '홀짝 패턴 분포',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1000
                }
            }
        });

        return this.charts.pattern;
    }

    /**
     * 번호 추천 차트 생성
     * @param {Array} recommendations - 추천 번호 배열
     * @param {string} canvasId - Canvas 요소 ID
     */
    createRecommendationChart(recommendations, canvasId = 'frequencyChart') {
        const ctx = document.getElementById(canvasId);
        if (!ctx) {
            console.error(`Canvas element with id '${canvasId}' not found`);
            return;
        }

        // 기존 차트 제거
        if (this.charts.recommendation) {
            this.charts.recommendation.destroy();
        }

        // 추천 번호를 하나의 문자열로 합치기
        const allNumbers = [];
        recommendations.forEach((rec, index) => {
            rec.numbers.forEach(num => {
                allNumbers.push({
                    number: num,
                    recommendation: index + 1,
                    color: this.getRecommendationColor(rec.type)
                });
            });
        });

        // 번호별 출현 횟수 계산
        const numberCounts = {};
        allNumbers.forEach(item => {
            numberCounts[item.number] = (numberCounts[item.number] || 0) + 1;
        });

        const labels = [];
        const data = [];
        const backgroundColors = [];

        for (let num = 1; num <= 45; num++) {
            if (numberCounts[num]) {
                labels.push(`${num}번`);
                data.push(numberCounts[num]);
                
                // 추천에 포함된 번호는 특별한 색상
                const isRecommended = allNumbers.some(item => item.number === num);
                backgroundColors.push(isRecommended ? this.colors.success : this.colors.secondary);
            }
        }

        this.charts.recommendation = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '추천에 포함된 횟수',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(color => color + '80'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: '추천 번호 분포',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: '포함된 횟수'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: '로또 번호'
                        }
                    }
                }
            }
        });

        return this.charts.recommendation;
    }

    /**
     * 추천 타입에 따른 색상 반환
     * @param {string} type - 추천 타입
     */
    getRecommendationColor(type) {
        const colorMap = {
            'hot': this.colors.hot,
            'cold': this.colors.cold,
            'balanced': this.colors.balanced,
            'mixed': this.colors.primary,
            'random': this.colors.secondary
        };
        return colorMap[type] || this.colors.primary;
    }

    /**
     * 모든 차트 제거
     */
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    /**
     * 특정 차트 제거
     * @param {string} chartType - 차트 타입
     */
    destroyChart(chartType) {
        if (this.charts[chartType]) {
            this.charts[chartType].destroy();
            delete this.charts[chartType];
        }
    }

    /**
     * 차트 업데이트
     * @param {string} chartType - 차트 타입
     * @param {Object} data - 새로운 데이터
     */
    updateChart(chartType, data) {
        if (this.charts[chartType]) {
            this.charts[chartType].data = data;
            this.charts[chartType].update();
        }
    }
}

// 전역 변수로 사용할 수 있도록 내보내기
if (typeof window !== 'undefined') {
    window.LottoChart = LottoChart;
}