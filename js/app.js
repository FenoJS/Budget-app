// BUDGER CONTROLLER

const budgetController = (function() {
  const data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    }

    calcPercentage(totalIncome) {
      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
        this.percentage = -1;
      }
    }

    getPercentage() {
      return this.percentage;
    }
  }


  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const calculateTotal = function(type) {
    let sum = 0;
    data.allItems[type].forEach((item) => {
      sum += item.value;
    });

    data.totals[type] = sum;
  };

  return {
    addItem(type, des, val) {
      let newItem;
      let ID;

      // Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Creat new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem(type, id) { // ??
      const ids = data.allItems[type].map(item => item.id);
      const index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget() {
      // Calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');
      // Calcluate budget
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate percentage of income
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages() {
      data.allItems.exp.forEach((item) => {
        item.calcPercentage(data.totals.inc);
      });
    },

    getPercentages() {
      const allPerc = data.allItems.exp.map(item => item.getPercentage());

      return allPerc;
    },

    getBudget() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    testing() {
      console.log(data);
    },
  };
}());


// UI CONTROLLER

const UIController = (function() {
  const DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month',

  };

  const nodeListForEach = function(list, callback) {
    for (let i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  const formatNumber = function(num, type) {
    let number = num;
    number = Math.abs(number);
    number = (Math.round((number) * 100) / 100).toFixed(2); // toFixed returns string

    const numSplit = number.split('.');

    let int = numSplit[0];
    const dec = numSplit[1];

    if (int.length > 3) {
      int = `${int.substr(0, int.length - 3)},${int.substr(int.length - 3, 3)}`;
    }

    return `${(type === 'exp' ? '-' : '+')} ${int}.${dec}`;
  };

  return {
    getInput() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // Inc or Exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem(obj, type) {
      let html;
      let element;
      const formatedValue = formatNumber(obj.value, type); // for clarity
      // Create HTML string with placeholder text
      if (type === 'inc') {
        element = DOMstrings.incomeContainer;

        html = `<div class="item clearfix" id="inc-${obj.id}"><div class="item__description">${obj.description}</div><div class="right clearfix">
        <div class="item__value">${formatedValue}</div><div class="item__delete"><button class="item__delete--btn">
        <i class="ion-ios-close-outline"></i></button></div></div></div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;

        html = `<div class="item clearfix" id="exp-${obj.id}"><div class="item__description">${obj.description}</div>
        <div class="right clearfix"><div class="item__value">${formatedValue}</div><div class="item__percentage">21%</div>
        <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
      }

      document.querySelector(element).insertAdjacentHTML('beforeend', html);
    },

    deleteListItem(selectorID) {
      const el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields() {
      const fields = document.querySelectorAll(`${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);

      const fieldsArr = Array.from(fields);

      fieldsArr.forEach((item) => {
        item.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget(obj) {
      const type = obj.budget > 0 ? 'inc' : 'exp';

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');


      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = `${obj.percentage}%`;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages(percentages) {
      const fields = document.querySelectorAll(DOMstrings.expensesPercLabel);


      nodeListForEach(fields, (item, index) => {
        if (percentages[index] > 0) {
          item.textContent = `${percentages[index]}%`;
        } else {
          item.textContent = '---';
        }
      });
    },

    displayMonth() {
      const now = new Date();
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Ocotober', 'November', 'December'];
      const year = now.getFullYear();
      const month = now.getMonth();
      document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
    },

    changedType() {
      const fields = document.querySelectorAll(`${DOMstrings.inputType}, ${DOMstrings.inputDescription}, ${DOMstrings.inputValue}`);
      nodeListForEach(fields, (item) => {
        item.classList.toggle('red-focus');
      });

      document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
    },

    getDOMstrings() {
      return DOMstrings;
    },
  };
}());


// GLOBAL APP CONTROLLER

const controller = (function(budgetCtrl, UICtrl) {
  const updateBudget = function() {
    budgetCtrl.calculateBudget();
    const budget = budgetCtrl.getBudget();
    UICtrl.displayBudget(budget);
  };

  const updatePercentages = function() {
    // Calculate percentages
    budgetCtrl.calculatePercentages();
    // Read percantage from the budget controller
    const percentages = budgetCtrl.getPercentages();
    // Update the UI with the new percentage
    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = function() {
    // Get the input data
    const input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // Add item to the budget controller
      const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // add the item to the UI
      UICtrl.addListItem(newItem, input.type);
      // Clear the fields
      UICtrl.clearFields();
      // Calculate and update budget
      updateBudget();
      // Calculate and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = function(event) {
    const itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      const splitID = itemID.split('-');
      const type = splitID[0];
      const ID = parseInt(splitID[1]);
      // Delete item from data
      budgetCtrl.deleteItem(type, ID);
      // Delete item from UI
      UICtrl.deleteListItem(itemID);
      // Update and show new budget
      updateBudget();
      updatePercentages();
    }
  };


  const setupEventListeners = function() {
    const DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', (e) => {
      if (e.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };


  return {
    init() {
      console.log('Application has started');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1,
      });
      setupEventListeners();
    },
  };
}(budgetController, UIController));


controller.init();