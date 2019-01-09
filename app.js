// defining a module - creates a new scope which protects data
// below variable is an immediately invoked function expression that returns an object

// BUDGET CONTROLLER
var budgetController = (function() {
    // function constructor - first letter capital
    // all objects created through them will inherit these methods

    var Expense = function(id, description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Income = function(id, description,value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach((current) => {
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    // data structure for storing data 
    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals : {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val) {
            var neweItem, ID;

            // ID = (ID of the last element) +1
            // Create new id
            if(data.allItems[type].length > 0) {
                ID = (data.allItems[type][data.allItems[type].length - 1].id) + 1;
            } else {
                ID = 0;
            }

            // Create new item
            if(type === 'exp') {
                neweItem = new Expense(ID,des,val);
            } else {
                neweItem = new Income(ID,des,val);
            }

            // Push it into our data structure
            data.allItems[type].push(neweItem);

            // Return new element
            return neweItem;
        },

        deleteItem: function(type, id) {
            var ids, index;

            // returns the array of id's
            ids = data.allItems[type].map((current) => current.id);
            /* same as
                ids = data.allItems[type].map(function(current) {
                    return current.id;
                });
            */

            index = ids.indexOf(id);
            // not found = -1
            if(index !== -1) {
                // splice(index , number of elements to be deleted) - used to delete an element
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },

        // Note: You must wrap the returning object literal into parentheses. 
        // Otherwise curly braces will be considered to denote the function’s body. 
        getBudget: () => ({
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
        })
        /* same as:
            getBudget: function() {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        */
    }

})();

// UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
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
        container: '.container'
    };      

    return {
        getInput: function () {
            return{
                type : document.querySelector(DOMstrings.inputType).value, // Will be either 'inc' or 'exp'
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml,element;
            // Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstrings.incomeContainer; 
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else {
                element = DOMstrings.expensesContainer; 
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">-%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function() {
            var fields, fieldsArr;

            // Returns a list
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            // converting the list into an array
            fieldsArr = Array.prototype.slice.call(fields);

            // new type of for loop
            fieldsArr.forEach((current,index,array) => {
                current.value = '';
            });
            /* same as:
                fieldsArr.forEach(function(current,index,array) {
                    current.value = "";
                });
            */

            // set focus back to 1st element
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            
            if(obj.percentage>0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage +'%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '-';
            }
        },

        getDOMstrings: () => DOMstrings
        /* Same as 
            getDOMstrings: function() {
                return DOMstrings;
            }
        */
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UIController.getDOMstrings();

        // dont add () to ctrlAddItem - as eventListener will automatically call it
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        // keypress - any key is pressed; e- event variable
        document.addEventListener('keypress', function(e) {
            // which - for older browsers
            // keycode => 13 is for enter key
            if(e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); 
    };

    var updateBudget = function() {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Returns the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UIController.displayBudget(budget);
    };

    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get field input data
        input = UIController.getInput();

        if(input.description != "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
    
            // 3. Add item to the UI
            UIController.addListItem(newItem,input.type);
    
            // 4. Clear the fields
            UIController.clearFields();
    
            // 5. Calculate and update budget
            updateBudget();
        }

    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID,type,ID ;
        // retrieve the ID of the block to be deleted
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        // other blocks donot have an ID
        // therefore, if ID is not NULL, delete item
        if(itemID) {
            // format: inc-1
            // '-' is the split character
            splitID = itemID.split('-');
            type = splitID[0];
            ID = splitID[1];

            // 1. Delete item from data structure


            // 2. Delete item from UI


            // 3. Update and show the new budget


        }
    };

    return {
        init: function() {
            console.log('Application has started!');
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }; 

})(budgetController, UIController);

// without this line of code nothing will happen as there will be no event listeners
controller.init();