/**
 * QuickChart Radar Chart Generator
 * Generates dark-themed visual scorecards for the 5-Part Agent Readiness Score
 * https://quickchart.io (Free, Zero-auth, High resolution)
 */

export interface ReadinessScoreValues {
  overallScore: number;
  setupScore: number;
  testScore: number;
  archScore: number;
  safetyScore: number;
  multiAgentScore: number;
}

/**
 * Builds a QuickChart Radar Chart image URL
 */
export function generateReadinessRadarChartUrl(
  scores: ReadinessScoreValues,
  repoName: string = 'Repository'
): string {
  const chartConfig = {
    type: 'radar',
    data: {
      labels: [
        'Setup & Execution',
        'Test Verification',
        'Architecture Topology',
        'Boundary Safety',
        'Multi-Agent Coverage',
      ],
      datasets: [
        {
          label: `${repoName} (${scores.overallScore}%)`,
          data: [
            scores.setupScore,
            scores.testScore,
            scores.archScore,
            scores.safetyScore,
            scores.multiAgentScore,
          ],
          backgroundColor: 'rgba(6, 182, 212, 0.25)', // Cyan accent fill
          borderColor: 'rgba(6, 182, 212, 1)',
          pointBackgroundColor: 'rgba(255, 255, 255, 1)',
          pointBorderColor: 'rgba(6, 182, 212, 1)',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(6, 182, 212, 1)',
          borderWidth: 2.5,
          pointRadius: 4,
        },
      ],
    },
    options: {
      legend: {
        display: true,
        labels: {
          fontColor: '#f8fafc',
          fontFamily: 'monospace',
          fontSize: 13,
        },
      },
      scale: {
        ticks: {
          beginAtZero: true,
          max: 100,
          stepSize: 20,
          display: false,
        },
        gridLines: {
          color: 'rgba(255, 255, 255, 0.15)',
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.15)',
        },
        pointLabels: {
          fontColor: '#94a3b8',
          fontSize: 11,
          fontFamily: 'monospace',
        },
      },
    },
  };

  const chartParams = new URLSearchParams({
    c: JSON.stringify(chartConfig),
    bkg: '#0a0a0a', // Dark theme background
    w: '500',
    h: '420',
    devicePixelRatio: '2',
  });

  return `https://quickchart.io/chart?${chartParams.toString()}`;
}
