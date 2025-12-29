/**
 * 로또 번호 분석 JavaScript 라이브러리
 * 기존 Python 분석 로직을 JavaScript로 변환
 * 리팩토링: 일관된 에러 처리, 코드 구조 개선
 */

/**
 * 로또 분석기 클래스
 * 리팩토링: 에러 처리 및 유효성 검사 추가
 */
class LottoAnalyzer {
    constructor() {
        this.data = [];
        this.analysisResults = {};
        this.isValidating = true; // 데이터 유효성 검사 플래그
        this.logger = {
            info: (msg) => console.log(`[INFO] ${msg}`),
            warn: (msg) => console.warn(`[WARN] ${msg}`),
            error: (msg) => console.error(`[ERROR] ${msg}`)
        };
    }

    /**
     * 데이터 유효성 검사
     * @param {Array} lottoData - 검증할 데이터
     * @returns {boolean} 유효성 여부
     */
    validateData(lottoData) {
        if (!Array.isArray(lottoData)) {
            this.logger.error('데이터가 배열이 아닙니다.');
            return false;
        }

        if (lottoData.length === 0) {
            this.logger.warn('데이터가 비어있습니다.');
            return false;
        }

        // 처음 5개 항목만 검증 (성능 고려)
        const requiredFields = ['draw_no', 'draw_date', 'num1', 'num2', 'num3', 'num4', 'num5', 'num6', 'bonus'];
        
        for (let i = 0; i < Math.min(5, lottoData.length); i++) {
            const item = lottoData[i];
            
            if (typeof item !== 'object' || item === null) {
                this.logger.error(`항목 ${i}가 올바른 객체가 아닙니다.`);
                return false;
            }

            // 필수 필드 검사
            for (const field of requiredFields) {
                if (!(field in item)) {
                    this.logger.error(`항목 ${i}에 필수 필드 '${field}'가 없습니다.`);
                    return false;
                }
            }

            // 번호 유효성 검사
            const numbers = [item.num1, item.num2, item.num3, item.num4, item.num5, item.num6, item.bonus];
            for (const num of numbers) {
                if (typeof num !== 'number' || num < 1 || num > 45) {
                    this.logger.error(`항목 ${i}에 유효하지 않은 번호가 있습니다: ${num}`);
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * 데이터 로드
     * @param {Array} lottoData - 로또 데이터 배열
     * @throws {Error} 유효하지 않은 데이터 시
     */
    loadData(lottoData) {
        try {
            if (this.isValidating && !this.validateData(lottoData)) {
                throw new Error('데이터 유효성 검사 실패');
            }
            
            this.data = lottoData;
            this.analysisResults = {};
            this.logger.info(`데이터 로드 완료: ${lottoData.length}회차`);
        } catch (error) {
            this.logger.error(`데이터 로드 실패: ${error.message}`);
            throw error;
        }
    }

    /**
     * 모든 번호 추출
     */
    getAllNumbers() {
        let allNums = [];
        for (let d of this.data) {
            allNums.push(d.num1, d.num2, d.num3, d.num4, d.num5, d.num6);
        }
        return allNums;
    }

    /**
     * 빈도 분석
     */
    frequencyAnalysis() {
        const allNums = this.getAllNumbers();
        const freq = {};
        
        // 번호별 빈도 계산
        for (let num = 1; num <= 45; num++) {
            freq[num] = allNums.filter(n => n === num).length;
        }
        
        // 정렬된 결과
        const sortedFreq = Object.entries(freq)
            .sort(([,a], [,b]) => b - a);
        
        this.analysisResults.frequency = {
            frequencies: freq,
            sorted: sortedFreq,
            hotNumbers: sortedFreq.slice(0, 10),
            coldNumbers: sortedFreq.slice(-10).reverse(),
            totalDraws: this.data.length,
            expectedFrequency: (this.data.length * 6 / 45)
        };
        
        return this.analysisResults.frequency;
    }

    /**
     * 최근 트렌드 분석
     * @param {number} recentN - 최근 N회차 (0이면 전체)
     */
    recentTrendAnalysis(recentN = 0) {
        let recentData = this.data;
        if (recentN > 0 && recentN < this.data.length) {
            recentData = this.data.slice(-recentN);
        }
        
        const recentNums = [];
        for (let d of recentData) {
            recentNums.push(d.num1, d.num2, d.num3, d.num4, d.num5, d.num6);
        }
        
        const recentFreq = {};
        for (let num = 1; num <= 45; num++) {
            recentFreq[num] = recentNums.filter(n => n === num).length;
        }
        
        const sortedRecentFreq = Object.entries(recentFreq)
            .sort(([,a], [,b]) => b - a);
        
        // 미출현 번호
        const appeared = new Set(recentNums);
        const notAppeared = [];
        for (let num = 1; num <= 45; num++) {
            if (!appeared.has(num)) {
                notAppeared.push(num);
            }
        }
        
        this.analysisResults.recent = {
            frequencies: recentFreq,
            sorted: sortedRecentFreq,
            hotNumbers: sortedRecentFreq.slice(0, 10),
            notAppeared: notAppeared,
            period: recentN === 0 ? this.data.length : recentN
        };
        
        return this.analysisResults.recent;
    }

    /**
     * 홀짝/고저 패턴 분석
     */
    patternAnalysis() {
        const oddEvenPatterns = {};
        const highLowPatterns = {};
        
        for (let d of this.data) {
            const nums = [d.num1, d.num2, d.num3, d.num4, d.num5, d.num6];
            
            // 홀짝 패턴
            const oddCount = nums.filter(n => n % 2 === 1).length;
            const evenCount = 6 - oddCount;
            const oddEvenKey = `${oddCount}:${evenCount}`;
            oddEvenPatterns[oddEvenKey] = (oddEvenPatterns[oddEvenKey] || 0) + 1;
            
            // 고저 패턴 (1-22: 저, 23-45: 고)
            const lowCount = nums.filter(n => n <= 22).length;
            const highCount = 6 - lowCount;
            const highLowKey = `${lowCount}:${highCount}`;
            highLowPatterns[highLowKey] = (highLowPatterns[highLowKey] || 0) + 1;
        }
        
        this.analysisResults.pattern = {
            oddEven: Object.entries(oddEvenPatterns)
                .sort(([,a], [,b]) => b - a),
            highLow: Object.entries(highLowPatterns)
                .sort(([,a], [,b]) => b - a),
            totalDraws: this.data.length
        };
        
        return this.analysisResults.pattern;
    }

    /**
     * 연속번호 패턴 분석
     */
    consecutiveAnalysis() {
        const consecutiveCounts = {};
        
        for (let d of this.data) {
            const nums = [d.num1, d.num2, d.num3, d.num4, d.num5, d.num6].sort((a, b) => a - b);
            
            let consecutive = 0;
            for (let i = 0; i < nums.length - 1; i++) {
                if (nums[i + 1] - nums[i] === 1) {
                    consecutive++;
                }
            }
            consecutiveCounts[consecutive] = (consecutiveCounts[consecutive] || 0) + 1;
        }
        
        // 연속번호가 있는 비율 계산
        let hasConsecutive = 0;
        for (let count in consecutiveCounts) {
            if (parseInt(count) > 0) {
                hasConsecutive += consecutiveCounts[count];
            }
        }
        
        this.analysisResults.consecutive = {
            distribution: Object.entries(consecutiveCounts)
                .sort(([a], [b]) => parseInt(a) - parseInt(b)),
            hasConsecutive: hasConsecutive,
            totalDraws: this.data.length,
            percentage: (hasConsecutive / this.data.length * 100).toFixed(1)
        };
        
        return this.analysisResults.consecutive;
    }

    /**
     * 끝자리 분석
     */
    endingDigitAnalysis() {
        const allNums = this.getAllNumbers();
        const endingDigits = {};
        
        for (let digit = 0; digit <= 9; digit++) {
            endingDigits[digit] = allNums.filter(n => n % 10 === digit).length;
        }
        
        this.analysisResults.ending = {
            frequencies: endingDigits,
            total: allNums.length
        };
        
        return this.analysisResults.ending;
    }

    /**
     * 출현 주기 분석
     */
    cycleAnalysis() {
        const numberAppearances = {};
        
        // 각 번호의 출현 회차 기록
        for (let num = 1; num <= 45; num++) {
            numberAppearances[num] = [];
        }
        
        for (let i = 0; i < this.data.length; i++) {
            const nums = [this.data[i].num1, this.data[i].num2, this.data[i].num3, 
                         this.data[i].num4, this.data[i].num5, this.data[i].num6];
            for (let num of nums) {
                numberAppearances[num].push(i + 1);
            }
        }
        
        // 평균 주기 계산
        const avgCycles = {};
        const currentGaps = {};
        const totalDraws = this.data.length;
        
        for (let num = 1; num <= 45; num++) {
            const appearances = numberAppearances[num];
            
            if (appearances.length > 1) {
                const gaps = [];
                for (let i = 0; i < appearances.length - 1; i++) {
                    gaps.push(appearances[i + 1] - appearances[i]);
                }
                avgCycles[num] = gaps.reduce((a, b) => a + b) / gaps.length;
            }
            
            // 현재 미출현 기간
            const lastAppearance = appearances[appearances.length - 1] || 0;
            currentGaps[num] = totalDraws - lastAppearance;
        }
        
        // 정렬된 결과
        const sortedByCycle = Object.entries(avgCycles)
            .sort(([,a], [,b]) => a - b);
        
        const sortedByGap = Object.entries(currentGaps)
            .sort(([,a], [,b]) => b - a);
        
        this.analysisResults.cycle = {
            averageCycles: avgCycles,
            currentGaps: currentGaps,
            sortedByCycle: sortedByCycle,
            sortedByGap: sortedByGap,
            topFrequent: sortedByCycle.slice(0, 10),
            topGap: sortedByGap.slice(0, 10)
        };
        
        return this.analysisResults.cycle;
    }

    /**
     * 번호 정렬 (낮은 수가 왼쪽, 높은 수가 오른쪽)
     * @param {Array} numbers - 번호 배열
     */
    sortNumbers(numbers) {
        return [...numbers].sort((a, b) => a - b);
    }

    /**
     * 번호 추천 생성
     * @param {Object} options - 추천 옵션
     */
    generateRecommendations(options = {}) {
        const {
            numRecommendations = 5,
            strategy = 'mixed',
            recentPeriod = 0
        } = options;
        
        // 빈도 분석
        const freqResult = this.frequencyAnalysis();
        const recentResult = this.recentTrendAnalysis(recentPeriod);
        const cycleResult = this.cycleAnalysis();
        
        const recommendations = [];
        
        // 전략별 추천 번호 생성
        if (strategy === 'frequency' || strategy === 'mixed') {
            // 빈도 기반
            const hotNumbers = freqResult.hotNumbers.map(([num]) => parseInt(num));
            recommendations.push({
                name: '빈도 기반 (Hot Numbers)',
                type: 'hot',
                numbers: this.sortNumbers(hotNumbers.slice(0, 6))
            });
        }
        
        if (strategy === 'gap' || strategy === 'mixed') {
            // 미출현 기반
            const gapNumbers = cycleResult.topGap.map(([num]) => parseInt(num));
            recommendations.push({
                name: '미출현 기반 (Due Numbers)',
                type: 'cold',
                numbers: this.sortNumbers(gapNumbers.slice(0, 6))
            });
        }
        
        if (strategy === 'balanced' || strategy === 'mixed') {
            // 균형 전략 (홀짝 3:3, 고저 3:3)
            const allNumbers = Object.keys(freqResult.frequencies)
                .map(n => parseInt(n))
                .sort((a, b) => freqResult.frequencies[b] - freqResult.frequencies[a]);
            
            const oddNumbers = allNumbers.filter(n => n % 2 === 1).slice(0, 3);
            const evenNumbers = allNumbers.filter(n => n % 2 === 0).slice(0, 3);
            
            recommendations.push({
                name: '균형 전략 (홀짝 3:3)',
                type: 'balanced',
                numbers: this.sortNumbers([...oddNumbers, ...evenNumbers])
            });
        }
        
        if (strategy === 'mixed') {
            // 혼합 전략
            const mixed = [];
            const hotFreq = freqResult.hotNumbers.slice(0, 2).map(([num]) => parseInt(num));
            const dueNumbers = cycleResult.topGap.slice(0, 2).map(([num]) => parseInt(num));
            const recentHot = recentResult.hotNumbers.slice(0, 4).map(([num]) => parseInt(num));
            
            mixed.push(...hotFreq, ...dueNumbers.filter(n => !mixed.includes(n)));
            
            for (let num of recentHot) {
                if (mixed.length < 6 && !mixed.includes(num)) {
                    mixed.push(num);
                }
            }
            
            recommendations.push({
                name: '혼합 전략',
                type: 'mixed',
                numbers: this.sortNumbers(mixed.slice(0, 6))
            });
        }
        
        // 추가 추천 조합 생성
        while (recommendations.length < numRecommendations) {
            const randomNumbers = this.sortNumbers(this.generateRandomNumbers());
            recommendations.push({
                name: `추천 조합 ${recommendations.length + 1}`,
                type: 'random',
                numbers: randomNumbers
            });
        }
        
        this.analysisResults.recommendations = recommendations.slice(0, numRecommendations);
        return this.analysisResults.recommendations;
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
     * 전체 분석 실행
     * @param {Object} options - 분석 옵션
     */
    runFullAnalysis(options = {}) {
        const {
            recentPeriod = 0,
            includeRecommendations = true
        } = options;
        
        console.log('전체 분석 시작...');
        
        // 각 분석 실행
        this.frequencyAnalysis();
        this.recentTrendAnalysis(recentPeriod);
        this.patternAnalysis();
        this.consecutiveAnalysis();
        this.endingDigitAnalysis();
        this.cycleAnalysis();
        
        if (includeRecommendations) {
            this.generateRecommendations({
                recentPeriod: recentPeriod,
                strategy: 'mixed',
                numRecommendations: 5
            });
        }
        
        console.log('전체 분석 완료');
        return this.analysisResults;
    }

    /**
     * 데이터 요약 정보
     */
    getDataSummary() {
        if (this.data.length === 0) {
            return null;
        }
        
        return {
            totalDraws: this.data.length,
            startDate: this.data[0].draw_date,
            endDate: this.data[this.data.length - 1].draw_date,
            latestDraw: this.data[this.data.length - 1].draw_no
        };
    }
}

// 전역 변수として 사용할 수 있도록 내보내기
if (typeof window !== 'undefined') {
    window.LottoAnalyzer = LottoAnalyzer;
}