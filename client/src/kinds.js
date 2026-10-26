// What the three kinds of posts are called and which fields their forms have.
export const KINDS = {
  projects: {
    key: 'projects',
    singular: 'Project',
    plural: 'Projects',
    blurb: 'Things people have built: apps, games, experiments.',
    price: false,
    location: false
  },
  products: {
    key: 'products',
    singular: 'Product',
    plural: 'Products',
    blurb: 'Things people are offering, with a price and a place.',
    price: true,
    location: true
  },
  campgrounds: {
    key: 'campgrounds',
    singular: 'Campground',
    plural: 'Campgrounds',
    blurb: 'Places to stay outdoors, with a nightly price and a place on the map.',
    price: true,
    location: true
  }
};

export const KIND_LIST = Object.values(KINDS);
