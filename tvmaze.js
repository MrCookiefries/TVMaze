/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */
/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  const config = {
    params: {
      q: query
    }
  };
  const shows = [];
  try {
    const response = await axios.get(`http://api.tvmaze.com/search/shows`, config);
    for (let {show} of response.data) {
      const {id, name, summary} = show;
      const image = show.image ? show.image.original: "https://tinyurl.com/tv-missing";
      shows.push({id, name, summary, image});
    }
    return shows;
  } catch (e) {
    console.log(e);
  }
}

/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

 async function getEpisodes(id) {
  const episodes = [];
  try {
    const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes?specials=1`);
    for (let episode of response.data) {
      const {id, name, season, number} = episode;
      episodes.push({id, name, season, number});
    }
    return episodes;
  } catch (e) {
    console.log(e);
  }
}


/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */
const $showsList = $("#shows-list");

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    let $item = $(`
      <div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
        <div class="card" data-show-id="${show.id}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <img class="card-img-top" src="${show.image}">
            <p class="card-text">${show.summary}</p>
            <button>Episodes</button>
          </div>
        </div>
      </div>
    `);

    $showsList.append($item);
  }
}

/** Populate episodes list:
 *     - given list of episodes, add episodes to DOM
 */

function populateEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();

  for (let episode of episodes) {
    const $item = $(`
      <li data-episode-id="${episode.id}">
        ${episode.name} (Season: ${episode.season}, Number: ${episode.number})
      </li>
    `);
    $episodesList.append($item);
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch(evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  const $episodesArea = $("#episodes-area");
  $episodesArea.hide();

  let shows = await searchShows(query);

  populateShows(shows);

  $episodesArea.show();
});

$showsList.on("click", "button", async e => {
  const $button = $(e.target);
  const id = $button.parent().parent().data("show-id");
  const episodes = await getEpisodes(id);
  populateEpisodes(episodes);
});
