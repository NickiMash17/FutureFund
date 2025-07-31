// Theme Toggle Function - Must be in global scope
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update icon
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) {
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// Initialize theme from localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Set correct icon
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) {
    themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize theme
  initTheme();

  // Initialize tooltips
  if (typeof bootstrap !== 'undefined') {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function(tooltipTriggerEl) {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }

  // Interest rate slider
  const interestRateSlider = document.getElementById('returnRate');
  const interestRateValue = document.getElementById('returnRateValue');
  
  if (interestRateSlider && interestRateValue) {
    interestRateValue.textContent = `${interestRateSlider.value}%`;
    interestRateSlider.addEventListener('input', function() {
      interestRateValue.textContent = `${this.value}%`;
    });
  }

  document.getElementById("retirementForm").addEventListener("submit", function (e) {
  const currentAge = parseInt(document.getElementById("currentAge").value, 10);
  const retirementAge = parseInt(document.getElementById("retirementAge").value, 10);

  if (currentAge >= retirementAge) {
    e.preventDefault();
    alert("Retirement age must be greater than current age.");
    return;
  }

  // Proceed with calculations if valid
});

  // Form submission
  const form = document.getElementById('retirementForm');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (!this.checkValidity()) {
        this.classList.add('was-validated');
        return;
      }
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        const calculateText = submitBtn.querySelector('.calculate-text');
        const spinner = submitBtn.querySelector('.spinner-border');
        
        if (calculateText) calculateText.classList.add('d-none');
        if (spinner) {
          spinner.classList.remove('d-none');
        } else {
          // Create spinner if it doesn't exist
          const spinnerEl = document.createElement('span');
          spinnerEl.className = 'spinner-border spinner-border-sm ms-2';
          spinnerEl.setAttribute('role', 'status');
          submitBtn.appendChild(spinnerEl);
        }
      }
      
      // Perform calculation with try-catch to prevent silent failures
      setTimeout(() => {
        try {
          calculateRetirement();
          console.log("Calculation completed successfully");
        } catch (error) {
          console.error("Error in calculation:", error);
          showAlert('An error occurred during calculation. Please check console for details.', 'danger');
        } finally {
          // Reset button state
          if (submitBtn) {
            submitBtn.disabled = false;
            const calculateText = submitBtn.querySelector('.calculate-text');
            const spinner = submitBtn.querySelector('.spinner-border');
            if (calculateText) calculateText.classList.remove('d-none');
            if (spinner) spinner.classList.add('d-none');
          }
        }
      }, 500); // Small delay for better UX
    });
  }

  // Initialize scenarios
  initScenarios();
});

// SCENARIO MANAGEMENT
let savedScenarios = [];

function initScenarios() {
  try {
    savedScenarios = JSON.parse(localStorage.getItem('retirementScenarios')) || [];
    renderScenarios();
    
    // Show scenarios section after initialization if there are scenarios
    const scenariosSection = document.getElementById('scenarios');
    if (scenariosSection) {
      scenariosSection.style.display = savedScenarios.length > 0 ? 'block' : 'none';
    }
    
    const saveScenarioBtn = document.getElementById('saveScenario');
    if (saveScenarioBtn) {
      saveScenarioBtn.addEventListener('click', saveScenario);
    }
  } catch (error) {
    console.error("Error initializing scenarios:", error);
  }
}

function saveScenario() {
  const currentAge = document.getElementById('currentAge')?.value;
  const retirementAge = document.getElementById('retirementAge')?.value;
  const monthlyContribution = document.getElementById('monthlyContribution')?.value;
  const currentSavings = document.getElementById('currentSavings')?.value || '0';
  const interestRate = document.getElementById('returnRate')?.value || '7';

  if (!currentAge || !retirementAge || !monthlyContribution) {
    showAlert('Please complete the calculator first', 'warning');
    return;
  }

  const scenario = {
    id: Date.now(),
    name: `Scenario ${savedScenarios.length + 1}`,
    currentAge,
    retirementAge,
    monthlyContribution,
    currentSavings,
    interestRate,
    date: new Date().toLocaleDateString()
  };
  
  savedScenarios.push(scenario);
  localStorage.setItem('retirementScenarios', JSON.stringify(savedScenarios));
  renderScenarios();
  showAlert('Scenario saved!', 'success');
}

function renderScenarios() {
  const container = document.getElementById('scenariosContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (savedScenarios.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="alert alert-info">
          Save different scenarios to compare them here
        </div>
      </div>
    `;
    return;
  }
  
  savedScenarios.forEach(scenario => {
    const scenarioEl = document.createElement('div');
    scenarioEl.className = 'col-md-6 col-lg-4 mb-3';
    scenarioEl.innerHTML = `
      <div class="scenario-card">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h4>${scenario.name}</h4>
          <small class="text-muted">${scenario.date}</small>
        </div>
        <div class="scenario-values">
          <div><small>Age</small><div>${scenario.currentAge} → ${scenario.retirementAge}</div></div>
          <div><small>Monthly</small><div>R${formatCurrency(scenario.monthlyContribution)}</div></div>
          <div><small>Savings</small><div>R${formatCurrency(scenario.currentSavings)}</div></div>
          <div><small>Return</small><div>${scenario.interestRate}%</div></div>
        </div>
        <button class="btn btn-sm btn-outline-primary w-100 mt-2 load-scenario" 
                data-id="${scenario.id}">
          <i class="fas fa-chart-line me-1"></i> Load
        </button>
        <button class="btn btn-sm btn-outline-danger w-100 mt-2 delete-scenario" 
                data-id="${scenario.id}">
          <i class="fas fa-trash me-1"></i> Delete
        </button>
      </div>
    `;
    container.appendChild(scenarioEl);
  });

  // Add event listeners to new buttons
  document.querySelectorAll('.load-scenario').forEach(btn => {
    btn.addEventListener('click', function() {
      const scenario = savedScenarios.find(s => s.id === parseInt(this.dataset.id));
      if (scenario) loadScenario(scenario);
    });
  });

  document.querySelectorAll('.delete-scenario').forEach(btn => {
    btn.addEventListener('click', function() {
      if (confirm('Delete this scenario?')) {
        savedScenarios = savedScenarios.filter(s => s.id !== parseInt(this.dataset.id));
        localStorage.setItem('retirementScenarios', JSON.stringify(savedScenarios));
        renderScenarios();
      }
    });
  });
}

function loadScenario(scenario) {
  document.getElementById('currentAge').value = scenario.currentAge;
  document.getElementById('retirementAge').value = scenario.retirementAge;
  document.getElementById('monthlyContribution').value = scenario.monthlyContribution;
  
  if (document.getElementById('currentSavings')) {
    document.getElementById('currentSavings').value = scenario.currentSavings;
  }
  
  if (document.getElementById('returnRate')) {
    document.getElementById('returnRate').value = scenario.interestRate;
  }
  
  if (document.getElementById('returnRateValue')) {
    document.getElementById('returnRateValue').textContent = `${scenario.interestRate}%`;
  }
  
  // Trigger calculation
  const submitBtn = document.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.click();
  } else {
    // If submit button not found, calculate directly
    calculateRetirement();
  }
}

// CALCULATOR FUNCTIONS
function calculateRetirement() {
  console.log("Starting calculation...");
  
  // Get input values
  const currentAge = parseInt(document.getElementById('currentAge')?.value);
  const retirementAge = parseInt(document.getElementById('retirementAge')?.value);
  const currentSavings = parseFloat(document.getElementById('currentSavings')?.value) || 0;
  const monthlyContribution = parseFloat(document.getElementById('monthlyContribution')?.value);
  const annualInterestRate = parseFloat(document.getElementById('returnRate')?.value || 7) / 100;

  console.log("Input values:", { currentAge, retirementAge, currentSavings, monthlyContribution, annualInterestRate });

  // Validate inputs
  if (isNaN(currentAge)) {
    showAlert('Please enter your current age', 'danger');
    return;
  }
  
  if (isNaN(retirementAge)) {
    showAlert('Please enter your desired retirement age', 'danger');
    return;
  }
  
  if (retirementAge <= currentAge) {
    showAlert('Retirement age must be greater than current age', 'danger');
    return;
  }
  
  if (isNaN(monthlyContribution)) {
    showAlert('Please enter a valid monthly contribution', 'danger');
    return;
  }

  // Calculate years until retirement
  const yearsToRetirement = retirementAge - currentAge;
  const monthlyInterestRate = annualInterestRate / 12;
  const monthsToRetirement = yearsToRetirement * 12;

  console.log("Years to retirement:", yearsToRetirement);

  // Initialize variables 
  let total = currentSavings;
  let totalContributions = currentSavings;
  const yearlyData = [];
  const labels = [];
  const contributionsData = [];
  const interestData = [];
  const totalData = [];

  // Calculate month by month
  for (let month = 1; month <= monthsToRetirement; month++) {
    const interest = total * monthlyInterestRate;
    total += monthlyContribution + interest;
    totalContributions += monthlyContribution;
    
    // Store yearly data
    if (month % 12 === 0 || month === monthsToRetirement) {
      const year = Math.floor(month / 12);
      const yearTotalContributions = totalContributions;
      const yearTotalInterest = total - totalContributions;
      
      labels.push(`Year ${year} (Age ${currentAge + year})`);
      contributionsData.push(yearTotalContributions);
      interestData.push(yearTotalInterest);
      totalData.push(total);
      
      yearlyData.push({
        year: year,
        age: currentAge + year,
        total: total,
        contributions: yearTotalContributions,
        interest: yearTotalInterest
      });
    }
  }

  console.log("Calculation complete. Final values:", { total, totalContributions, interest: total - totalContributions });
  console.log("First few yearly data points:", yearlyData.slice(0, 3));

  // Update results display
  updateResults(total, totalContributions, total - totalContributions);
  
  // Create/update chart
  try {
    renderChart(labels, contributionsData, interestData, yearlyData, totalData);
  } catch (error) {
    console.error("Error rendering chart:", error);
    showAlert('Error displaying chart. Please check console for details.', 'warning');
  }
  
  // Show results sections
  const resultsSection = document.getElementById('results');
  if (resultsSection) {
    resultsSection.style.display = 'block';
    console.log("Results section displayed");
  } else {
    console.error("Results section not found!");
  }
  
  // Also update the original result section
  const resultSection = document.getElementById('result');
  if (resultSection) {
    resultSection.style.display = 'block';
    const retirementAmount = document.getElementById('retirement-amount');
    if (retirementAmount) {
      retirementAmount.textContent = `Your estimated retirement savings will be: R${formatCurrency(total)}`;
    }
  }
  
  // Show next steps
  const nextStepSection = document.getElementById('next-step');
  if (nextStepSection) {
    nextStepSection.style.display = 'block';
  }
  
  // Show scenarios section
  const scenariosSection = document.getElementById('scenarios');
  if (scenariosSection) {
    scenariosSection.style.display = 'block';
  }
  
  // Update progress steps
  updateProgressSteps();
  
  // Scroll to results
  setTimeout(() => {
    const resultsElement = document.getElementById('results');
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth' });
    }
  }, 300);
}

function updateResults(total, contributions, interest) {
  console.log("Updating results display with:", { total, contributions, interest });
  
  const totalElement = document.getElementById('totalAmount');
  const contributionsElement = document.getElementById('totalContributions');
  const interestElement = document.getElementById('totalInterest');
  const insightElement = document.getElementById('savingsInsight');
  
  if (totalElement) {
    totalElement.textContent = `R${formatCurrency(total)}`;
    console.log("Updated total amount");
  } else {
    console.error("totalAmount element not found!");
  }
  
  if (contributionsElement) {
    contributionsElement.textContent = `R${formatCurrency(contributions)}`;
  }
  
  if (interestElement) {
    interestElement.textContent = `R${formatCurrency(interest)}`;
  }
  
  if (insightElement) {
    if (interest > contributions) {
      insightElement.textContent = "Your investments are working harder than your contributions!";
    } else if (interest > contributions * 0.5) {
      insightElement.textContent = "Your money is growing significantly through compound interest.";
    } else if (interest > 0) {
      insightElement.textContent = "Your money is growing through compound interest.";
    } else {
      insightElement.textContent = "Consider increasing contributions or investment returns.";
    }
  }
}

function renderChart(labels, contributions, interest, yearlyData, totalData) {
  const ctx = document.getElementById('retirementChart');
  if (!ctx) {
    console.error("Chart canvas element not found!");
    return;
  }
  
  console.log("Rendering chart...");
  console.log("Chart data:", { 
    labels: labels.length, 
    contributionsData: yearlyData.map(y => y.contributions).length,
    interestData: yearlyData.map(y => y.interest).length,
    totalData: yearlyData.map(y => y.total).length
  });
  
  // Destroy previous chart if exists
  if (window.retirementChart instanceof Chart) {
    window.retirementChart.destroy();
    console.log("Destroyed previous chart");
  }

  // Ensure all data arrays are of the same length and have no undefined values
  const dataLength = Math.min(
    labels.length,
    yearlyData.length
  );
  
  // Safely extract data for the chart
  const contributionsDataset = [];
  const interestDataset = [];
  const totalDataset = [];
  const safeLabels = [];
  
  for (let i = 0; i < dataLength; i++) {
    if (yearlyData[i] && labels[i]) {
      contributionsDataset.push(yearlyData[i].contributions || 0);
      interestDataset.push(yearlyData[i].interest || 0);
      totalDataset.push(yearlyData[i].total || 0);
      safeLabels.push(labels[i]);
    }
  }
  
  console.log("Safe data lengths:", {
    labels: safeLabels.length,
    contributions: contributionsDataset.length,
    interest: interestDataset.length,
    total: totalDataset.length
  });

  // Create the chart with error handling
  try {
    window.retirementChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: safeLabels,
        datasets: [
          {
            label: 'Contributions',
            data: contributionsDataset,
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Interest',
            data: interestDataset,
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Total Balance',
            data: totalDataset,
            type: 'line',
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(153, 102, 255, 1)',
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: false,
            grid: { display: false }
          },
          y: {
            stacked: false,
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return 'R' + formatCurrency(value);
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: R${formatCurrency(context.raw)}`;
              }
            }
          }
        }
      }
    });
    console.log("Chart created successfully");
  } catch (error) {
    console.error("Error creating chart:", error, error.stack);
    showAlert('Failed to create chart. Please check browser console for details.', 'danger');
  }
}

// HELPER FUNCTIONS
function formatCurrency(value) {
  return parseFloat(value).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function showAlert(message, type) {
  console.log(`Alert: ${message} (${type})`);
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show position-fixed bottom-0 end-0 m-3`;
  alert.style.zIndex = '1000';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  document.body.appendChild(alert);
  
  setTimeout(() => {
    alert.classList.add('show');
    setTimeout(() => {
      alert.classList.remove('show');
      setTimeout(() => alert.remove(), 150);
    }, 3000);
  }, 10);
}

function updateProgressSteps() {
  const steps = document.querySelectorAll('.progress-step');
  if (!steps.length) {
    console.log("Progress steps not found");
    return;
  }
  
  steps.forEach((step, index) => {
    step.classList.remove('active');
    if (index === 0) {
      step.classList.add('active'); // Initial step always active
    }
    if (index === 1 && document.getElementById('results').style.display !== 'none') {
      step.classList.add('active'); // Second step active when results are shown
    }
    if (index === 2 && document.getElementById('next-step').style.display !== 'none') {
      step.classList.add('active'); // Third step active when next steps are shown
    }
  });
  console.log("Progress steps updated");
}


// Enhanced Navigation Active State Management
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const currentPage = window.location.pathname.split('/').pop();
  
  // Function to update active nav links
  function updateActiveNav() {
    // First reset all active states
    navLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    // If on calculator page, highlight calculator link
    if (currentPage === 'calculator.html') {
      navLinks.forEach(link => {
        if (link.getAttribute('href') === 'calculator.html') {
          link.classList.add('active');
        }
      });
      return;
    }
    
    // For index page, handle section highlighting
    if (currentPage === 'index.html' || currentPage === '') {
      const sections = document.querySelectorAll('section[id]');
      let currentSection = '';
      
      // Find which section is currently in view
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= (sectionTop - 300)) {
          currentSection = section.getAttribute('id');
        }
      });
      
      // Highlight the corresponding nav link
      navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === `index.html#${currentSection}` || 
            (linkHref === 'index.html' && currentSection === 'home')) {
          link.classList.add('active');
        }
      });
    }
  }
  
  // Initial update
  updateActiveNav();
  
  // Update on scroll
  window.addEventListener('scroll', function() {
    if (currentPage === 'index.html' || currentPage === '') {
      updateActiveNav();
    }
  });
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
        
        // Update URL without reload
        history.pushState(null, null, targetId);
        
        // Update active nav after scroll completes
        setTimeout(updateActiveNav, 1000);
      }
    });
  });
});

// Dark mode for navbar

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update icon
  const themeIcon = document.querySelector('.theme-toggle i');
  if (themeIcon) {
    themeIcon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  // Force navbar color update (may be needed for Bootstrap)
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (newTheme === 'dark') {
      navbar.classList.remove('bg-primary');
      navbar.classList.add('bg-dark');
    } else {
      navbar.classList.remove('bg-dark');
      navbar.classList.add('bg-primary');
    }
  }
}



