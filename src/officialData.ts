import raw from './official.json';
import { tagsFor } from './interests';

// official.json with fine-grained interest tags applied.
const officialData = { ...raw, items: raw.items.map(item => ({ ...item, tags: tagsFor(item.title, item.tags) })) };
export default officialData;
