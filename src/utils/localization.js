import { CATEGORY_ID_MAP, SERVICE_ID_MAP, CORE_ID_MAP } from '../constants';

export const getLocalizedLabel = (id, language) => {
  if (language !== 'ko') return id;
  return CATEGORY_ID_MAP[id] || SERVICE_ID_MAP[id] || CORE_ID_MAP[id] || id;
};

export const getLocalizedTag = (tag, language) => {
  if (language !== 'ko') return tag;
  return CATEGORY_ID_MAP[tag] || SERVICE_ID_MAP[tag] || CORE_ID_MAP[tag] || tag;
};
