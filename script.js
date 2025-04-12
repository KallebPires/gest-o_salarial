 // Dados da aplicação
 let userData = {
    salary: 0,
    fixedExpenses: [],
    plannedPurchases: [],
    savingsPreferences: {
        emergency: 0.10,  // 10% para fundo de emergência
        retirement: 0.05, // 5% para aposentadoria
        goals: 0.15,      // 15% para objetivos (viagens, compras grandes)
        leisure: 0.10     // 10% para lazer e entretenimento
    }
};

// Carregar dados salvos do localStorage
function loadData() {
    const savedData = localStorage.getItem('financialPlannerData');
    if (savedData) {
        userData = JSON.parse(savedData);

        // Adicionar as preferências de reserva se não existirem no dados salvos
        if (!userData.savingsPreferences) {
            userData.savingsPreferences = {
                emergency: 0.10,
                retirement: 0.05,
                goals: 0.15,
                leisure: 0.10
            };
            saveData();
        }

        // Atualizar interface com dados carregados
        document.getElementById('salary').value = userData.salary;

        // Renderizar gastos fixos
        const expenseList = document.getElementById('expense-list');
        expenseList.innerHTML = '';
        userData.fixedExpenses.forEach((expense, index) => {
            addExpenseToUI(expense.name, expense.amount, index);
        });

        // Renderizar compras planejadas
        const purchaseList = document.getElementById('purchase-list');
        purchaseList.innerHTML = '';
        userData.plannedPurchases.forEach((purchase, index) => {
            addPurchaseToUI(purchase.name, purchase.amount, purchase.month, index);
        });

        // Atualizar resumos
        updateSummary();
        updateForecast();
    }
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('financialPlannerData', JSON.stringify(userData));
}

// Adicionar um gasto fixo à interface
function addExpenseToUI(name, amount, index) {
    const expenseList = document.getElementById('expense-list');
    const expenseItem = document.createElement('div');
    expenseItem.className = 'expense-item';

    expenseItem.innerHTML = `
        <div>
            <strong>${name}</strong>: R$ ${parseFloat(amount).toFixed(2)}
        </div>
        <button class="delete-btn" data-index="${index}">Remover</button>
    `;

    expenseList.appendChild(expenseItem);

    // Adicionar evento para remover o gasto
    expenseItem.querySelector('.delete-btn').addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        userData.fixedExpenses.splice(index, 1);
        saveData();

        // Atualizar a interface
        expenseList.innerHTML = '';
        userData.fixedExpenses.forEach((expense, idx) => {
            addExpenseToUI(expense.name, expense.amount, idx);
        });

        updateSummary();
        updateForecast();
    });
}

// Adicionar uma compra planejada à interface
function addPurchaseToUI(name, amount, month, index) {
    const purchaseList = document.getElementById('purchase-list');
    const purchaseItem = document.createElement('div');
    purchaseItem.className = 'purchase-item';

    // Converter número do mês para texto
    const monthNames = [
        "Este mês",
        "Próximo mês",
        "Em 2 meses",
        "Em 3 meses",
        "Em 4 meses",
        "Em 5 meses",
        "Em 6 meses"
    ];

    purchaseItem.innerHTML = `
        <div>
            <strong>${name}</strong>: R$ ${parseFloat(amount).toFixed(2)} - ${monthNames[month]}
        </div>
        <button class="delete-btn" data-index="${index}">Remover</button>
    `;

    purchaseList.appendChild(purchaseItem);

    // Adicionar evento para remover a compra
    purchaseItem.querySelector('.delete-btn').addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        userData.plannedPurchases.splice(index, 1);
        saveData();

        // Atualizar a interface
        purchaseList.innerHTML = '';
        userData.plannedPurchases.forEach((purchase, idx) => {
            addPurchaseToUI(purchase.name, purchase.amount, purchase.month, idx);
        });

        updateSummary();
        updateForecast();
    });
}

// Atualizar o resumo financeiro
function updateSummary() {
    const totalIncome = userData.salary;
    const totalExpenses = userData.fixedExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const totalPurchasesCurrent = userData.plannedPurchases
        .filter(purchase => purchase.month === 0)
        .reduce((sum, purchase) => sum + parseFloat(purchase.amount), 0);
    const balance = totalIncome - totalExpenses - totalPurchasesCurrent;

    document.getElementById('total-income').textContent = `R$ ${totalIncome.toFixed(2)}`;
    document.getElementById('total-expenses').textContent = `R$ ${totalExpenses.toFixed(2)}`;
    document.getElementById('total-purchases-current').textContent = `R$ ${totalPurchasesCurrent.toFixed(2)}`;

    const balanceElement = document.getElementById('balance-current');
    balanceElement.textContent = `R$ ${balance.toFixed(2)}`;

    // Adicionar classe baseada no saldo
    if (balance >= 0) {
        balanceElement.className = 'positive';
    } else {
        balanceElement.className = 'negative';
    }

    // Atualizar o resumo no relatório PDF
    document.getElementById('report-income').textContent = `R$ ${totalIncome.toFixed(2)}`;
    document.getElementById('report-expenses').textContent = `R$ ${totalExpenses.toFixed(2)}`;
    document.getElementById('report-purchases-current').textContent = `R$ ${totalPurchasesCurrent.toFixed(2)}`;

    const reportBalanceElement = document.getElementById('report-balance-current');
    reportBalanceElement.textContent = `R$ ${balance.toFixed(2)}`;

    if (balance >= 0) {
        reportBalanceElement.className = 'positive';
    } else {
        reportBalanceElement.className = 'negative';
    }
}

// Atualizar a previsão para os próximos meses
function updateForecast() {
    const forecastContainer = document.getElementById('months-forecast');
    forecastContainer.innerHTML = '';

    // Obter data atual
    const currentDate = new Date();
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Criar previsão para 6 meses
    for (let i = 0; i < 7; i++) {
        const forecastMonth = new Date(currentDate);
        forecastMonth.setMonth(currentDate.getMonth() + i);

        const monthName = months[forecastMonth.getMonth()];
        const year = forecastMonth.getFullYear();

        // Calcular saldo para este mês
        const totalIncome = userData.salary;
        const totalExpenses = userData.fixedExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const totalPurchasesMonth = userData.plannedPurchases
            .filter(purchase => parseInt(purchase.month) === i)
            .reduce((sum, purchase) => sum + parseFloat(purchase.amount), 0);

        const balance = totalIncome - totalExpenses - totalPurchasesMonth;

        // Criar card para o mês
        const monthCard = document.createElement('div');
        monthCard.className = 'month-card';

        monthCard.innerHTML = `
            <h3>${monthName}/${year}</h3>
            <div class="summary-item">
                <span>Renda:</span>
                <span>R$ ${totalIncome.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Gastos Fixos:</span>
                <span>R$ ${totalExpenses.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Compras Planejadas:</span>
                <span>R$ ${totalPurchasesMonth.toFixed(2)}</span>
            </div>
            <div class="summary-total">
                <span>Saldo:</span>
                <span class="${balance >= 0 ? 'positive' : 'negative'}">R$ ${balance.toFixed(2)}</span>
            </div>
        `;

        forecastContainer.appendChild(monthCard);
    }
}

// Calcular e mostrar sugestões de reserva
function calculateSavings() {
    // Mostrar a seção de sugestão de reserva
    document.getElementById('savings-suggestion').style.display = 'block';

    // Obter valores financeiros
    const totalIncome = userData.salary;
    const totalExpenses = userData.fixedExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    const availableBalance = totalIncome - totalExpenses;

    // Atualizar os valores na interface
    document.getElementById('savings-income').textContent = `R$ ${totalIncome.toFixed(2)}`;
    document.getElementById('savings-expenses').textContent = `R$ ${totalExpenses.toFixed(2)}`;
    document.getElementById('savings-available').textContent = `R$ ${availableBalance.toFixed(2)}`;

    // Criar as barras de sugestão de reserva
    const savingsBarsContainer = document.getElementById('savings-bars');
    savingsBarsContainer.innerHTML = '';

    const savingsCategories = [
        { name: 'Fundo de Emergência', percentage: userData.savingsPreferences.emergency, description: 'Para imprevistos e emergências' },
        { name: 'Aposentadoria', percentage: userData.savingsPreferences.retirement, description: 'Investimento de longo prazo' },
        { name: 'Objetivos Futuros', percentage: userData.savingsPreferences.goals, description: 'Viagens, compras grandes' },
        { name: 'Lazer e Entretenimento', percentage: userData.savingsPreferences.leisure, description: 'Para seu bem-estar' }
    ];

    // Calcular e criar barras para cada categoria
    savingsCategories.forEach(category => {
        const savingsAmount = availableBalance * category.percentage;
        const savingsPercentage = category.percentage * 100;

        const barContainer = document.createElement('div');
        barContainer.innerHTML = `
            <div class="summary-item">
                <span>${category.name} (${savingsPercentage}%)</span>
                <span>R$ ${savingsAmount.toFixed(2)}/mês</span>
            </div>
            <div class="savings-bar">
                <div class="savings-bar-fill" style="width: ${savingsPercentage}%;"></div>
                <div class="savings-bar-label">
                    <span>${category.description}</span>
                    <span>${savingsPercentage}%</span>
                </div>
            </div>
        `;
        savingsBarsContainer.appendChild(barContainer);
    });

    // Calcular total de reservas
    const totalSavings = savingsCategories.reduce((sum, category) => {
        return sum + (availableBalance * category.percentage);
    }, 0);

    // Adicionar total de reservas
    const totalContainer = document.createElement('div');
    totalContainer.innerHTML = `
        <div class="summary-total" style="margin-top: 20px;">
            <span>Total de Reservas Sugeridas:</span>
            <span>R$ ${totalSavings.toFixed(2)}/mês</span>
        </div>
        <div class="summary-item" style="margin-top: 10px;">
            <span>Saldo Restante após Reservas:</span>
            <span>R$ ${(availableBalance - totalSavings).toFixed(2)}/mês</span>
        </div>
    `;
    savingsBarsContainer.appendChild(totalContainer);

    // Atualizar relatório PDF com sugestões de reserva
    updateReportSavings(savingsCategories, availableBalance, totalSavings);
}

// Atualiza a seção de sugestões de reserva no relatório
function updateReportSavings(categories, availableBalance, totalSavings) {
    const reportSavingsContainer = document.getElementById('report-savings');
    reportSavingsContainer.innerHTML = '';

    categories.forEach(category => {
        const savingsAmount = availableBalance * category.percentage;
        const savingsPercentage = category.percentage * 100;

        const savingsItem = document.createElement('div');
        savingsItem.className = 'summary-item';
        savingsItem.innerHTML = `
            <span>${category.name} (${savingsPercentage}%):</span>
            <span>R$ ${savingsAmount.toFixed(2)}/mês</span>
        `;
        reportSavingsContainer.appendChild(savingsItem);
    });

    // Adicionar total de reservas
    const totalContainer = document.createElement('div');
    totalContainer.className = 'summary-total';
    totalContainer.innerHTML = `
        <span>Total de Reservas Sugeridas:</span>
        <span>R$ ${totalSavings.toFixed(2)}/mês</span>
    `;
    reportSavingsContainer.appendChild(totalContainer);
}

// Preparar e gerar o relatório em PDF
function generatePdfReport() {
    // Atualizar a data do relatório
    const today = new Date();
    const formattedDate = today.toLocaleDateString('pt-BR');
    document.getElementById('report-date').textContent = `Data: ${formattedDate}`;

    // Preencher a lista de gastos fixos no relatório
    const reportExpensesList = document.getElementById('report-expenses-list');
    reportExpensesList.innerHTML = '';

    if (userData.fixedExpenses.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Nenhum gasto fixo cadastrado.';
        reportExpensesList.appendChild(emptyMessage);
    } else {
        userData.fixedExpenses.forEach(expense => {
            const expenseItem = document.createElement('div');
            expenseItem.className = 'summary-item';
            expenseItem.innerHTML = `
                <span>${expense.name}:</span>
                <span>R$ ${parseFloat(expense.amount).toFixed(2)}</span>
            `;
            reportExpensesList.appendChild(expenseItem);
        });
    }

    // Preencher a lista de compras planejadas no relatório
    const reportPurchasesList = document.getElementById('report-purchases-list');
    reportPurchasesList.innerHTML = '';

    if (userData.plannedPurchases.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Nenhuma compra planejada cadastrada.';
        reportPurchasesList.appendChild(emptyMessage);
    } else {
        // Ordenar compras por mês
        const purchasesByMonth = {};
        const monthNames = [
            "Este mês",
            "Próximo mês",
            "Em 2 meses",
            "Em 3 meses",
            "Em 4 meses",
            "Em 5 meses",
            "Em 6 meses"
        ];

        userData.plannedPurchases.forEach(purchase => {
            const monthKey = monthNames[purchase.month];
            if (!purchasesByMonth[monthKey]) {
                purchasesByMonth[monthKey] = [];
            }
            purchasesByMonth[monthKey].push(purchase);
        });

        // Adicionar compras agrupadas por mês
        for (const [month, purchases] of Object.entries(purchasesByMonth)) {
            const monthHeading = document.createElement('h3');
            monthHeading.textContent = month;
            monthHeading.style.marginTop = '15px';
            monthHeading.style.marginBottom = '5px';
            reportPurchasesList.appendChild(monthHeading);

            let totalForMonth = 0;

            purchases.forEach(purchase => {
                const purchaseItem = document.createElement('div');
                purchaseItem.className = 'summary-item';
                purchaseItem.innerHTML = `
                    <span>${purchase.name}:</span>
                    <span>R$ ${parseFloat(purchase.amount).toFixed(2)}</span>
                `;
                reportPurchasesList.appendChild(purchaseItem);
                totalForMonth += parseFloat(purchase.amount);
            });

            // Adicionar total para o mês
            const totalItem = document.createElement('div');
            totalItem.className = 'summary-item';
            totalItem.style.fontWeight = 'bold';
            totalItem.innerHTML = `
                <span>Total ${month}:</span>
                <span>R$ ${totalForMonth.toFixed(2)}</span>
            `;
            reportPurchasesList.appendChild(totalItem);
        }
    }

    // Preencher a previsão para os próximos meses
    const reportForecast = document.getElementById('report-forecast');
    reportForecast.innerHTML = '';

    // Obter data atual
    const currentDate = new Date();
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    // Criar previsão para 3 meses (simplifcado para o relatório)
    for (let i = 0; i < 3; i++) {
        const forecastMonth = new Date(currentDate);
        forecastMonth.setMonth(currentDate.getMonth() + i);

        const monthName = months[forecastMonth.getMonth()];
        const year = forecastMonth.getFullYear();

        // Calcular saldo para este mês
        const totalIncome = userData.salary;
        const totalExpenses = userData.fixedExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
        const totalPurchasesMonth = userData.plannedPurchases
            .filter(purchase => parseInt(purchase.month) === i)
            .reduce((sum, purchase) => sum + parseFloat(purchase.amount), 0);

        const balance = totalIncome - totalExpenses - totalPurchasesMonth;

        const monthForecast = document.createElement('div');
        monthForecast.className = 'report-section';
        monthForecast.style.marginBottom = '15px';
        monthForecast.innerHTML = `
            <h3>${monthName}/${year}</h3>
            <div class="summary-item">
                <span>Renda:</span>
                <span>R$ ${totalIncome.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Gastos Fixos:</span>
                <span>R$ ${totalExpenses.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <span>Compras Planejadas:</span>
                <span>R$ ${totalPurchasesMonth.toFixed(2)}</span>
            </div>
            <div class="summary-total">
                <span>Saldo:</span>
                <span class="${balance >= 0 ? 'positive' : 'negative'}">R$ ${balance.toFixed(2)}</span>
            </div>
        `;

        reportForecast.appendChild(monthForecast);
    }

    // Verificar se temos as sugestões de reserva e calcular se necessário
    if (document.getElementById('report-savings').children.length === 0) {
        calculateSavings();
    }

    // Gerar o PDF
    const reportContainer = document.getElementById('report-container');
    const options = {
        margin: 10,
        filename: `relatorio_financeiro_${formattedDate.replace(/\//g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Tornar o container visível para gerar o PDF
    reportContainer.style.display = 'block';

    // Gerar o PDF e depois ocultar o container novamente
    html2pdf().from(reportContainer).set(options).save().then(() => {
        reportContainer.style.display = 'none';
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados salvos
    loadData();

    // Salvar salário
    document.getElementById('save-salary').addEventListener('click', function() {
        const salaryInput = document.getElementById('salary');
        const salary = parseFloat(salaryInput.value) || 0;

        userData.salary = salary;
        saveData();
        updateSummary();
        updateForecast();

        alert('Salário salvo com sucesso!');
    });

    // Adicionar gasto fixo
    document.getElementById('add-expense').addEventListener('click', function() {
        const nameInput = document.getElementById('expense-name');
        const amountInput = document.getElementById('expense-amount');

        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value) || 0;

        if (name && amount > 0) {
            const expense = { name, amount };
            userData.fixedExpenses.push(expense);

            addExpenseToUI(name, amount, userData.fixedExpenses.length - 1);

            // Limpar campos
            nameInput.value = '';
            amountInput.value = '';

            saveData();
            updateSummary();
            updateForecast();
        } else {
            alert('Por favor, preencha corretamente os campos de descrição e valor.');
        }
    });

    // Adicionar compra planejada
    document.getElementById('add-purchase').addEventListener('click', function() {
        const nameInput = document.getElementById('purchase-name');
        const amountInput = document.getElementById('purchase-amount');
        const monthInput = document.getElementById('purchase-month');

        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value) || 0;
        const month = parseInt(monthInput.value);

        if (name && amount > 0) {
            const purchase = { name, amount, month };
            userData.plannedPurchases.push(purchase);

            addPurchaseToUI(name, amount, month, userData.plannedPurchases.length - 1);

            // Limpar campos
            nameInput.value = '';
            amountInput.value = '';
            monthInput.value = '0';

            saveData();
            updateSummary();
            updateForecast();
        } else {
            alert('Por favor, preencha corretamente os campos de item e valor.');
        }
    });

    // Botão para calcular sugestões de reserva
    document.getElementById('calculate-savings').addEventListener('click', function() {
        calculateSavings();
    });

    // Botão para baixar relatório PDF
    document.getElementById('download-pdf').addEventListener('click', function() {
        generatePdfReport();
    });
});