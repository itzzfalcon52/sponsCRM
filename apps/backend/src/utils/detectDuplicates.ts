import Fuse from 'fuse.js';

export const detectPotentialDuplicates = (newName: string, existingCompanies: any[]) => {
  const options = {
    includeScore: true,
    // Threshold: 0.0 = perfect match, 1.0 = total mismatch. 
    // 0.3 is usually the "sweet spot" for SaaS deduplication.
    threshold: 0.3, 
    keys: ['name']
  };

  const fuse = new Fuse(existingCompanies, options);
  return fuse.search(newName);
};