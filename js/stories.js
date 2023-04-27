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

function generateStoryMarkup(story, setFav, dltbtn = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li class="story" id="${story.storyId}">
        <div class="story-div">
        ${dltbtn ? `${getDeleteBtnHTML()}` : ""}
        <i class="fa-star ${(setFav) ? "fas" : "far"} star"> </i>
        <a href = "${story.url}" target = "a_blank" class="story-link" >
          ${story.title}
        </a >
        <small class="story-hostname"> (${hostName})</small>
        </div>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
        <hr>
      </li >
  `);
}

/*taken from working version made by springboard bc I didn't want to make my own trashcan */
function getDeleteBtnHTML() {
  return `
      <span class="trash-can">
        <i class="fas fa-trash-alt"></i>
      </span>`;
}

function getEditBtnHTML() {
  return `
      <span class="edit-button">
        <i class="fas fa-edit"></i>
      </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story, false);
    $allStoriesList.append($story);
  }
  if (currentUser) {
    currentUser.favorites.forEach(fav => {
      $allStoriesList.find(`#${fav.storyId} i`).toggleClass("far fas");
    });
  }
  $allStoriesList.show();
}

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allFavsList.empty();

  //console.log(storyList);
  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(new Story(story), true);
    $allFavsList.append($story);
  }
  if ($allFavsList.html() === "") {
    $allFavsList.append($("<span>").text("No favorites added!"))
  }
  $allFavsList.show();
}

function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $allMyList.empty();

  console.log(storyList);
  console.log(currentUser);
  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(new Story(story), false, true);
    $allMyList.append($story);
  }
  if ($allMyList.html() === "") {
    $allMyList.append($("<span>").text("No stories added by user yet!"))
  }
  else {
    currentUser.favorites.forEach(fav => {
      $allMyList.find(`#${fav.storyId}`).find(".star").toggleClass("far fas");
    });
  }
  $allMyList.show();
}


async function submitForm(e) {
  e.preventDefault();
  console.log($submitForm, { title: $submitForm.find("#add-title").val(), author: $submitForm.find("#add-author").val(), url: $submitForm.find("#add-url").val() });
  const story = await storyList.addStory(currentUser, { title: $submitForm.find("#add-title").val(), author: $submitForm.find("#add-author").val(), url: $submitForm.find("#add-url").val() });

  console.log(story);
  $allStoriesList.prepend(generateStoryMarkup(story, false));

  $submitForm.slideUp("slow");
  $submitForm.trigger("reset");
}

$submitForm.on("submit", submitForm);

$storyLists.on("click", ".star", (e) => {
  const story = e.target.parentElement.id;
  e.target.classList.toggle("fas");
  e.target.classList.toggle("far");
  if (e.target.classList.contains("fas")) {
    storyList.addFavorite(currentUser, story);
  }
  else {
    storyList.removeFavorite(currentUser, story);
  }
});

$allMyList.on("click", ".trash-can i", async (e) => {
  const story = e.target.parentElement.parentElement.parentElement;
  //console.log(story);
  const response = await axios({
    url: `${BASE_URL}/stories/${story.id}`,
    method: "DELETE",
    data: { token: currentUser.loginToken }
  });
  storyList.stories = storyList.stories.filter(val => val.storyId !== story.id);

  //console.log(currentUser);
  currentUser.ownStories = currentUser.ownStories.filter(val => val.storyId !== story.id);
  currentUser.favorites = currentUser.favorites.filter(val => val.storyId !== story.id);

  story.remove();
  if ($allMyList.html() === "") {
    $allMyList.append($("<span>").text("No stories added by user yet!"))
  }
});

// $allMyList.on("click", ".edit-button i", async (e) => {
//   const story = e.target.parentElement.parentElement.parentElement;
//   const box = story.querySelector(".story-link");
//   if (box === null) {
//     return;
//   }
//   //const oldHTML = box.outerHTML;
//   console.log(await editStoryElement(box, story.id));
//   // $form.after(`<a href = "${1}" target = "a_blank" class="story-link" >
//   //   ${2}
//   // </a >`);
//   // $form.remove();
// });

// async function editStoryElement(element, storyId) {
//   element.outerHTML =
//     `<form class="edit-form">
//     <input value="${element.innerText}"/>
//     <button class="edit-title edit-change"><i class="fas fa-check"></i></button>
//     <button class="edit-title edit-exit"><i class="fas fa-long-arrow-alt-left"></i></button>
//   </form>`;
//   const $form = $(`#${storyId} form`);
//   //console.log($form);
//   return await $form.on("click", ".edit-change", () => {
//     const $input = $(`#${storyId} form input`);
//     // try {
//     //   storyList.updateStory(currentUser, storyId, $input.val());
//     // }
//     // catch (e) {
//     //   console.log("Story update failed!", e);
//     //   return;
//     // }
//     let storyUrl;
//     storyList.stories.forEach(val => {
//       if (val.storyId === storyId) {
//         storyUrl = val.url;
//         val.title = $input.val();
//       }
//     });
//     return { url: storyUrl, value: $input.val(), form: $form };
//   });
// }
