"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
      ${showStar ? getStarHTML(story, currentUser) : ""}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <button type="submit" class="delete-button">Delete</button>
      </li>
    `);
}

/**Write a function in stories.js that is called when users submit the form. Pick a good name for it. This 
 * function should get the data from the form, call the .addStory method you wrote, and then put that new 
 * story on the page.  */

async function submitStory(e) { //called when users submit the form
  console.debug("submitStory");
  e.preventDefault();
  //form data
  const title = $("#new-title").val();  //get data from form - title, username, author and url.
  const username = "someguytn"; //user.currentUser
  const author = $("#new-author").val();
  const url = $("#new-url").val();
  const storyData = { title, url, author, username };
  
  const story = await storyList.addStory(currentUser, storyData);  //call .addStory method
  //put story on page
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  //reset form and hide
  $storyForm.trigger("reset");
  $storyForm.slideUp("slow");
}

$storyForm.on("submit", submitStory);

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function allFavoritesList() {
  console.debug("allFavoritesList");
  $favoriteStories.empty()

  if(currentUser.favorites.length === 0) {
    $favoriteStories.append("<p> No favorite stories.</p>");
  } else {
    for(let favorite of currentUser.favorites) {
      const $favorite = generateStoryMarkup(favorite)
      $favoriteStories.append($favorite)
    }
  }
  $favoriteStories.show();
}

async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // see if the item is already favorited (checking by presence of star)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change star
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // currently not a favorite: do the opposite
    await currentUser.favorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesList.on("click", ".star", toggleStoryFavorite);

async function deleteStory(evt){
  console.debug("deleteStory");
  const $target = $(evt.target).closest("li");
  const targetId = $target.attr("id")

  await storyList.removeStory(currentUser, targetId);
  await putStoriesOnPage();
}

$allStoriesList.on("click", ".delete-button", deleteStory);

$("ol").on("click", ".delete-button", function(e) {
  e.preventDefault();
  $(this).parent().remove();
});

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}
