/**
 * Theme Management System
 * Controls the application's visual theme (light/dark mode)
 * and persists user preferences
 */

function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('.theme-toggle i');
  if (icon) {
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

/**
 * Calculator Core Logic
 * Handles form initialization and calculations
 */
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    
    const retirementForm = document.getElementById('retirementForm');
    if (!retirementForm) return; // Exit if not on calculator page
    
    const resultsSection = document.getElementById('results');
    const originalResult = document.getElementById('result');
    let retirementChart = null;

    retirementForm.addEventListener('submit', function(e) {
        e.preventDefault();
        calculateRetirement();
    });

    function calculateRetirement() {
        // Get input values
        const currentAge = parseInt(document.getElementById('exampleInputAge1').value);
        const retirementAge = parseInt(document.getElementById('exampleInputDesiredRetirementAge1').value);
        const currentIncome = parseFloat(document.getElementById('exampleInputCurrentIncome1').value);
        const monthlyContribution = parseFloat(document.getElementById('exampleInputMonthlyContribution1').value);
        const interestRate = parseFloat(document.getElementById('exampleInputAnnualInterestRate1').value) / 100;
        const inflationRate = parseFloat(document.getElementById('exampleInputInflationRate1').value) / 100;

        // Validate inputs
        if (retirementAge <= currentAge) {
          alert("Retirement age must be greater than current age");
          return;
        }
    
        if (
          isNaN(currentAge) ||
          isNaN(retirementAge) ||
          isNaN(currentIncome) ||
          isNaN(monthlyContribution) ||
          isNaN(interestRate) ||
          isNaN(inflationRate)
        ) {
          alert("Please fill in all fields with valid numbers");
          return;
        }
    
        // Calculate years until retirement
        const yearsToRetirement = retirementAge - currentAge;
    
        // Calculate real interest rate (adjusted for inflation)
        const realInterestRate = (1 + interestRate) / (1 + inflationRate) - 1;
    
        // Calculate retirement fund
        let yearlyData = [];
        let totalContributions = 0;
        let balance = 0;
    
        // Calculate yearly data
        for (let year = 0; year <= yearsToRetirement; year++) {
          const yearlyContribution = year === 0 ? 0 : monthlyContribution * 12;
          totalContributions += yearlyContribution;
    
          const interestEarned = balance * realInterestRate;
          balance = balance + yearlyContribution + interestEarned;
    
          yearlyData.push({
            year: currentAge + year,
            contributions: totalContributions,
            interest: balance - totalContributions,
            balance: balance,
          });
        }
    
        // Update original result
        document.getElementById('retirement-amount').textContent = `Your estimated retirement savings will be: R${formatNumber(balance.toFixed(2))}`;
    
        // Display enhanced results
        document.getElementById('totalAmount').textContent = 'R' + formatNumber(balance.toFixed(2));
        document.getElementById('totalContributions').textContent = 'R' + formatNumber(totalContributions.toFixed(2));
        document.getElementById('totalInterest').textContent = 'R' + formatNumber((balance - totalContributions).toFixed(2));
    
        // Generate insight
        const interestPercentage = ((balance - totalContributions) / balance * 100).toFixed(1);
        document.getElementById('savingsInsight').textContent =
          `${interestPercentage}% of your retirement fund will come from interest growth. ` +
          `Start early and stay consistent for best results.`;
    
        // Hide original result, show enhanced results
        originalResult.style.display = 'none';
        resultsSection.style.display = 'block';
    
        // Create chart
        createChart(yearlyData);
    
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    function createChart(data) {
        // Prepare data for chart
        const labels = data.map((d) => `Age ${d.year}`);
        const contributionsData = data.map((d) => d.contributions);
        const interestData = data.map((d) => d.interest);
        const balanceData = data.map((d) => d.balance);
    
        // Destroy existing chart if it exists
        if (retirementChart) {
          retirementChart.destroy();
        }
    
        // Create new chart
        const ctx = document.getElementById('retirementChart').getContext('2d');
        retirementChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [
              {
                label: 'Contributions',
                data: contributionsData,
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
              {
                label: 'Interest',
                data: interestData,
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
              {
                label: 'Total Balance',
                type: 'line',
                data: balanceData,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true,
                title: {
                  display: true,
                  text: 'Age',
                },
              },
              y: {
                stacked: true,
                title: {
                  display: true,
                  text: 'Amount (R)',
                },
                ticks: {
                  callback: function (value) {
                    if (value >= 1000000) {
                      return 'R' + (value / 1000000).toFixed(1) + 'M';
                    } else if (value >= 1000) {
                      return 'R' + (value / 1000).toFixed(1) + 'K';
                    }
                    return 'R' + value;
                  },
                },
              },
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function (context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    label += 'R' + formatNumber(context.raw.toFixed(2));
                    return label;
                  },
                },
              },
            },
          },
        });
    }

    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
});