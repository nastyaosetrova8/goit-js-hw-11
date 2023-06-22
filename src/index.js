import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  moreBtn: document.querySelector('.load-more'),
};

let query;
let page = 1;
const BASE_URL = 'https://pixabay.com/api/';
const PARAMS = `key=37605527-f3cca5f87cf77f5dd7578dcdc&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

elements.form.addEventListener('submit', handlerSubmit);
elements.moreBtn.addEventListener('click', handlerClickMore);

elements.moreBtn.hidden = true;

async function fetchRequest(info) {
  const resp = await axios.get(`${BASE_URL}?${PARAMS}&q=${info}`);
  if (resp.status !== 200) {
    throw new Error(resp.statusText);
  }
  return resp.data;
}

async function handlerSubmit(evt) {
  evt.preventDefault();
  query = evt.currentTarget.searchQuery.value;
  elements.form.reset();
  try {
    const data = await fetchRequest(query);

    if (!data.hits.length) {
      elements.moreBtn.hidden = true;
      Notiflix.Report.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      elements.moreBtn.hidden = false;
    }

    elements.gallery.innerHTML = createCardsMarkup(data.hits);

    const lightbox = new SimpleLightbox('.gallery a', {
      navText: ['<', '>'],
      captions: true,
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });
    form.refresh();

    console.log(data);
  } catch (err) {
    console.log(err);
  }
}

function createCardsMarkup(data) {
  return data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a href="${largeImageURL}" class="link">
  <div class="photo-card">
  <div class="img-wrapper">
        <img src="${webformatURL}" alt="${tags}" loading="lazy"/> </div>
        <div class="info">
         <p class="info-item"><b>Likes:</b> ${likes}</p>
    <p class="info-item"><b>Views:</b> ${views}</p>
    <p class="info-item"><b>Comments:</b> ${comments}</p>
    <p class="info-item"><b>Downloads:</b> ${downloads}</p>
        </div>
    </div>
</a>`;
      }
    )
    .join('');
}

async function handlerClickMore() {
  page += 1;

  const url = `${BASE_URL}?${PARAMS}&q=${query}&page=${page}&per_page=40`;
  try {
    const data = await fetchRequest(url);
    elements.gallery.insertAdjacentHTML(
      'beforeend',
      createCardsMarkup(data.hits)
    );
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    elements.form.refresh();

    let maxPage = data.totalHits / 40;
    if (page >= maxPage) {
      console.log(page);
      elements.moreBtn.hidden = true;
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (err) {
    console.log(err);
  }
}
