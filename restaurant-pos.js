// ==========================================
// Restaurant POS System (Portfolio Project)
// ==========================================

const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

const TAX_RATE = 0.18;
let cart = [];

const menu = [
  { id: 1, name: "Italian Pasta", price: 9.55 },
  { id: 2, name: "Veggie Rice Bowl", price: 8.65 },
  { id: 3, name: "Chicken & Potatoes", price: 15.55 },
  { id: 4, name: "Vegetarian Pizza", price: 6.45 },
  { id: 5, name: "Lemon Dessert", price: 4.50 },
  { id: 6, name: "Cold Coffee", price: 3.75 }
];

function showHeader() {
  console.clear();
  console.log(chalk.yellow.bold("\n=== LITTLE LEMON POS ==="));
}

function showMenu() {
  console.log(chalk.green("\nMenu:\n"));

  menu.forEach(item => {
    console.log(`${item.id}. ${item.name} - $${item.price}`);
  });
}

function viewCart() {
  console.log(chalk.cyan("\nYour Cart:"));

  if (cart.length === 0) {
    console.log("Cart is empty.");
    return;
  }

  cart.forEach(item => {
    console.log(`${item.name} - $${item.price}`);
  });
}

function addToCart(id) {
  const item = menu.find(d => d.id === id);

  if (item) {
    cart.push(item);
    console.log(chalk.green(`${item.name} added to cart.`));
  }
}

function calculateTotals() {

  let subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  let tax = subtotal * TAX_RATE;
  let total = subtotal + tax;

  return {
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2)
  };
}

function saveOrder(order) {

  let history = [];

  if (fs.existsSync("orders.json")) {
    history = JSON.parse(fs.readFileSync("orders.json"));
  }

  history.push(order);

  fs.writeFileSync("orders.json", JSON.stringify(history, null, 2));
}

function generateReceipt() {

  console.log(chalk.yellow("\n===== RECEIPT ====="));

  cart.forEach(item => {
    console.log(`${item.name} - $${item.price}`);
  });

  const totals = calculateTotals();

  console.log("---------------------");
  console.log(`Subtotal: $${totals.subtotal}`);
  console.log(`Tax: $${totals.tax}`);
  console.log(chalk.green(`Total: $${totals.total}`));

  const order = {
    items: cart,
    ...totals,
    date: new Date().toLocaleString()
  };

  saveOrder(order);

  console.log(chalk.blue("\nOrder saved to history."));
}

function showRevenue() {

  if (!fs.existsSync("orders.json")) {
    console.log("No orders yet.");
    return;
  }

  const orders = JSON.parse(fs.readFileSync("orders.json"));

  let revenue = 0;

  orders.forEach(order => {
    revenue += Number(order.total);
  });

  console.log(chalk.magenta(`\nTotal Revenue: $${revenue.toFixed(2)}`));
}

async function mainMenu() {

  showHeader();

  const answer = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "Select an option:",
    choices: [
      "View Menu",
      "Add Item to Cart",
      "View Cart",
      "Checkout",
      "View Revenue",
      "Exit"
    ]
  });

  switch (answer.action) {

    case "View Menu":
      showMenu();
      break;

    case "Add Item to Cart":

      const item = await inquirer.prompt({
        type: "number",
        name: "id",
        message: "Enter item ID:"
      });

      addToCart(item.id);
      break;

    case "View Cart":
      viewCart();
      break;

    case "Checkout":
      generateReceipt();
      cart = [];
      break;

    case "View Revenue":
      showRevenue();
      break;

    case "Exit":
      console.log("Goodbye!");
      process.exit();
  }

  await pause();
  mainMenu();
}

async function pause() {

  await inquirer.prompt({
    type: "input",
    name: "pause",
    message: "Press Enter to continue..."
  });
}

mainMenu();
