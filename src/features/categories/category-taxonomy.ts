export const categoryGroups = [
  {
    label: 'Clothing',
    value: 'clothing',
    options: [
      { label: 'General clothing', value: 'clothing' },
      { label: 'Women clothing', value: 'clothing_women' },
      { label: 'Men clothing', value: 'clothing_men' },
      { label: 'Shoes', value: 'clothing_shoes' },
      { label: 'Bags', value: 'clothing_bags' },
      { label: 'Accessories', value: 'clothing_accessories' },
      { label: 'Baby clothing', value: 'clothing_baby' },
    ],
  },
  {
    label: 'HomeCategory',
    value: 'home',
    options: [
      { label: 'General home items', value: 'home' },
      { label: 'Furniture', value: 'home_furniture' },
      { label: 'Home appliances', value: 'home_appliances' },
      { label: 'Kitchenware', value: 'home_kitchenware' },
      { label: 'Home decor', value: 'home_decor' },
      { label: 'Bedding and textiles', value: 'home_textiles' },
      { label: 'Garden and outdoor', value: 'home_garden' },
    ],
  },
  {
    label: 'Electronics',
    value: 'electronics',
    options: [
      { label: 'General electronics', value: 'electronics' },
      { label: 'Phones and tablets', value: 'electronics_phones' },
      { label: 'Computers and laptops', value: 'electronics_computers' },
      { label: 'TV and audio', value: 'electronics_tv_audio' },
      { label: 'Photo and video', value: 'electronics_photo_video' },
      { label: 'Gaming', value: 'electronics_gaming' },
      { label: 'Cables and chargers', value: 'electronics_cables' },
    ],
  },
  {
    label: 'Books',
    value: 'books',
    options: [
      { label: 'General books', value: 'books' },
      { label: 'Fiction and literature', value: 'books_fiction' },
      { label: 'School books', value: 'books_school' },
      { label: 'University books', value: 'books_university' },
      { label: 'Stationery', value: 'books_stationery' },
      { label: 'Art supplies', value: 'books_art_supplies' },
      { label: 'Music and movies', value: 'books_music_movies' },
    ],
  },
  {
    label: 'Children',
    value: 'children',
    options: [
      { label: 'General children items', value: 'children' },
      { label: 'Toys', value: 'children_toys' },
      { label: 'Strollers', value: 'children_strollers' },
      { label: 'Car seats', value: 'children_car_seats' },
      { label: 'Kids furniture', value: 'children_furniture' },
      { label: 'School supplies', value: 'children_school_supplies' },
      { label: 'Baby care', value: 'children_baby_care' },
    ],
  },
  {
    label: 'Sports',
    value: 'sports',
    options: [
      { label: 'General sports items', value: 'sports' },
      { label: 'Bicycles and scooters', value: 'sports_bicycles' },
      { label: 'Fitness equipment', value: 'sports_fitness' },
      { label: 'Outdoor gear', value: 'sports_outdoor' },
      { label: 'Team sports', value: 'sports_team' },
      { label: 'Camping', value: 'sports_camping' },
      { label: 'Musical instruments', value: 'sports_instruments' },
    ],
  },
  {
    label: 'Construction materials',
    value: 'construction',
    options: [
      { label: 'General construction materials', value: 'construction' },
      { label: 'Tools', value: 'construction_tools' },
      { label: 'Paint and finishing', value: 'construction_paint' },
      { label: 'Plumbing', value: 'construction_plumbing' },
      { label: 'Electrical supplies', value: 'construction_electrical' },
      { label: 'Tiles and flooring', value: 'construction_tiles_flooring' },
      { label: 'Doors and windows', value: 'construction_doors_windows' },
      { label: 'Wood and metal', value: 'construction_wood_metal' },
      { label: 'Hardware and fasteners', value: 'construction_hardware' },
    ],
  },
  {
    label: 'Vehicles and parts',
    value: 'vehicles',
    options: [
      { label: 'General vehicle items', value: 'vehicles' },
      { label: 'Car parts', value: 'vehicles_car_parts' },
      { label: 'Tires and wheels', value: 'vehicles_tires_wheels' },
      { label: 'Motorcycle parts', value: 'vehicles_motorcycle_parts' },
      { label: 'Bicycle parts', value: 'vehicles_bicycle_parts' },
      { label: 'Tools and accessories', value: 'vehicles_tools_accessories' },
    ],
  },
  {
    label: 'Beauty and health',
    value: 'beauty_health',
    options: [
      { label: 'General beauty and health', value: 'beauty_health' },
      { label: 'Beauty products', value: 'beauty_health_beauty' },
      { label: 'Personal care', value: 'beauty_health_personal_care' },
      { label: 'Medical supplies', value: 'beauty_health_medical' },
      { label: 'Mobility aids', value: 'beauty_health_mobility' },
    ],
  },
  {
    label: 'Pets',
    value: 'pets',
    options: [
      { label: 'General pet items', value: 'pets' },
      { label: 'Pet food', value: 'pets_food' },
      { label: 'Pet beds and houses', value: 'pets_beds_houses' },
      { label: 'Pet toys', value: 'pets_toys' },
      { label: 'Aquarium supplies', value: 'pets_aquarium' },
    ],
  },
  {
    label: 'Office and business',
    value: 'office',
    options: [
      { label: 'General office items', value: 'office' },
      { label: 'Office furniture', value: 'office_furniture' },
      { label: 'Office equipment', value: 'office_equipment' },
      { label: 'Packaging materials', value: 'office_packaging' },
      { label: 'Shop and cafe equipment', value: 'office_shop_cafe' },
    ],
  },
  {
    label: 'Other',
    value: 'other',
    options: [{ label: 'Other', value: 'other' }],
  },
] as const;

export type CategoryGroupValue = (typeof categoryGroups)[number]['value'];
export type CategoryValue =
  (typeof categoryGroups)[number]['options'][number]['value'];

export const categoryValues = categoryGroups.flatMap((group) =>
  group.options.map((option) => option.value),
) as CategoryValue[];

export const flatCategoryOptions = categoryGroups.flatMap((group) =>
  group.options.map((option) => ({
    groupLabel: group.label,
    groupValue: group.value,
    label: option.label,
    value: option.value,
  })),
);

export const topLevelCategoryOptions = categoryGroups.map((group) => ({
  label: group.label,
  value: group.value,
}));

export function isCategoryValue(value: string): value is CategoryValue {
  return categoryValues.includes(value as CategoryValue);
}

export function getCategoryOption(value: string) {
  return flatCategoryOptions.find((option) => option.value === value);
}

export function getCategoryGroupForValue(value: string) {
  return (
    categoryGroups.find((group) =>
      group.options.some((option) => option.value === value),
    ) ?? categoryGroups[categoryGroups.length - 1]
  );
}

export function formatCategoryLabel(
  value: string,
  t: (text: string) => string,
) {
  const option = getCategoryOption(value);

  if (!option) {
    return t(
      value
        .replaceAll('_', ' ')
        .replace(/^\w/, (letter) => letter.toUpperCase()),
    );
  }

  if (option.groupValue === option.value) {
    return t(option.groupLabel);
  }

  return `${t(option.groupLabel)} / ${t(option.label)}`;
}
