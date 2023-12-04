#! /usr/bin/env node

console.log(
    'This script populates some test recipe, categories to your database. Specified database as argument - e.g.: node populatedb <your MongoDB url>'
  );
  
  // Get arguments passed on command line
  const userArgs = process.argv.slice(2);
  
  const Recipe = require('./models/recipe')
  const Category = require('./models/category')
  
  const recipes = [];
  const categories = [];
  
  const mongoose = require("mongoose");
  mongoose.set("strictQuery", false);
  
  const mongoDB = userArgs[0];
  
  main().catch((err) => console.log(err));
  
  async function main() {
    console.log("Debug: About to connect");
    await mongoose.connect(mongoDB);
    console.log("Debug: Should be connected?");
    await createCategories();
    await createRecipes();
    console.log("Debug: Closing mongoose");
    mongoose.connection.close();
  }
  
  // We pass the index to the ...Create functions so that, for example,
  // categories[0] will always be the Gluten-free, regardless of the order
  // in which the elements of promise.all's argument complete.
  async function categoryCreate(index, name) {
    const category = new Category({ name: name });
    await category.save();
    categories[index] = category;
    console.log(`Added category: ${name}`);
  }
  
  async function recipeCreate(index, name, ingredients, instructions, categories) {
    const recipedetail = {
      name: name,
      ingredients: ingredients,
      instructions: instructions,
    };
    if (categories != false) recipedetail.categories = categories;
  
    const recipe = new Recipe(recipedetail);
    await recipe.save();
    recipes[index] = recipe;
    console.log(`Added recipe: ${name}`);
  }

  
  async function createCategories() {
    console.log("Adding categories");
    await Promise.all([
        categoryCreate(0, "Gluten-free"),
        categoryCreate(1, "Vegan"),
        categoryCreate(2, "Lactose-free"),
    ]);
  }
  
  async function createRecipes() {
    console.log("Adding Recipes");
    await Promise.all([
        recipeCreate(0,
        "Pizza",
        ["Flour", "Cheese", "Sauces", "Spices"],
        ["Make dough", "Add sauces", "Bake pizza"],
        [categories[1]]
      ),
      recipeCreate(1,
        "Sausage",
        ["Meat", "Pepper", "Salt", "Sheep Stomach"],
        ["Make sausage skin", "Add meat", "Dry"],
        [categories[0], categories[2]]
      ),
      recipeCreate(2,
        "Burger",
        ["Meat", "Bun", "Lettuce", "Pickles"],
        ["Cook Meat", "Make Burger", "Eat"],
        false
      ),
    ]);
  }