import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { createCardsMarkup } from './cards-markup';

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
      elements.moreBtn.classList.add('is-hidden');
      Notiflix.Report.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      elements.moreBtn.classList.remove('is-hidden');
    }

    elements.gallery.innerHTML = createCardsMarkup(data.hits);

    const lightbox = new SimpleLightbox('.gallery a', {
      navText: ['<', '>'],
      captions: true,
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });
    elements.form.refresh();

    console.log(data);
  } catch (err) {
    console.log(err);
  }
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

    let maxPage = data.totalHits / 40;
    if (page >= maxPage) {
      console.log(page);
      elements.moreBtn.classList.add('is-hidden');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }

    const lightbox = new SimpleLightbox('.gallery a', {
      navText: ['<', '>'],
      captions: true,
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });
    elements.form.refresh();
  } catch (err) {
    console.log(err);
  }
}
