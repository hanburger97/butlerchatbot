import {Router} from 'meteor/iron:router';

import Recipes from '/imports/api/recipes/recipes'

Router.route('/recipes/:sku', {
  template: 'Recipe',
  layout: 'RecipeLayout',
  waitOn: function () {
    return Meteor.subscribe('recipes.all')
  },
  data: function () {
    return Recipes.findOne({sku: this.params.sku});
  },
  action: function () {
    this.render();
  }
})

/*this.render('Recipe', {
 data: function () {
 return {
 name: "Linguine in Miso Butter with Spinach and Shiitakes",
 difficulty: "Easy",
 duration: "20 minutes",
 image: 'http://placehold.it/1200x500',
 description: `This dish brings together Japanese and Italian flavors with a velvety umami-rich sauce that clings
 on to each noodle.
 Fragrant basil and red pepper flakes lend brightness and just a touch of heat.`,
 author: `Gabrielle Pellerin`,
 ingredients: [
 {image: 'http://placehold.it/40', name: "Toasted Sesame"},
 {image: 'http://placehold.it/40', name: "Toasted Sesame"},
 {image: 'http://placehold.it/40', name: "Toasted Sesame"},
 {image: 'http://placehold.it/40', name: "Toasted Sesame"},
 {image: 'http://placehold.it/40', name: "Toasted Sesame"},
 {image: 'http://placehold.it/40', name: "Toasted Sesame"},
 {image: 'http://placehold.it/40', name: "Toasted Sesame"},
 {image: 'http://placehold.it/40', name: "Toasted Sesame"}
 ],
 steps: [
 {
 title: `Prep vegetables`,
 description: `Peel and finely chop garlic.
 Spicy jalapeno kielbasa drumstick meatloaf cupidatat, pork ut nisi shank occaecat strip steak excepteur
 pancetta doner sausage burgdoggen. Elit frankfurter bresaola adipisicing esse, consectetur jerky nulla quis
 proident do consequat corned beef.`,
 image: 'http://placehold.it/400x200'
 },
 {
 title: `Prep vegetables`,
 description: `Peel and finely chop garlic.
 Spicy jalapeno kielbasa drumstick meatloaf cupidatat, pork ut nisi shank occaecat strip steak excepteur
 pancetta doner sausage burgdoggen. Elit frankfurter bresaola adipisicing esse, consectetur jerky nulla quis
 proident do consequat corned beef.`,
 image: 'http://placehold.it/400x200'
 },
 {
 title: `Prep vegetables`,
 description: `Peel and finely chop garlic.
 Spicy jalapeno kielbasa drumstick meatloaf cupidatat, pork ut nisi shank occaecat strip steak excepteur
 pancetta doner sausage burgdoggen. Elit frankfurter bresaola adipisicing esse, consectetur jerky nulla quis
 proident do consequat corned beef.`,
 image: 'http://placehold.it/400x200'
 },
 {
 title: `Prep vegetables`,
 description: `Peel and finely chop garlic.
 Spicy jalapeno kielbasa drumstick meatloaf cupidatat, pork ut nisi shank occaecat strip steak excepteur
 pancetta doner sausage burgdoggen. Elit frankfurter bresaola adipisicing esse, consectetur jerky nulla quis
 proident do consequat corned beef.`,
 image: 'http://placehold.it/400x200'
 },
 {
 title: `Prep vegetables`,
 description: `Peel and finely chop garlic.
 Spicy jalapeno kielbasa drumstick meatloaf cupidatat, pork ut nisi shank occaecat strip steak excepteur
 pancetta doner sausage burgdoggen. Elit frankfurter bresaola adipisicing esse, consectetur jerky nulla quis
 proident do consequat corned beef.`,
 image: 'http://placehold.it/400x200'
 }
 ],

 }
 }
 });
 });*/
