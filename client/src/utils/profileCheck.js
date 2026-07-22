/**
 * Checks if a user profile is incomplete.
 * A profile is considered incomplete if essential fields like age, aboutMe, photoUrl, mobileNumber, or address are missing.
 */
export const isProfileIncomplete = (user) => {
  if (!user) return false;
  
  const hasAge = Boolean(user.age && Number(user.age) > 0);
  const hasBio = Boolean(user.aboutMe && String(user.aboutMe).trim().length > 0);
  const hasPhoto = Boolean(user.photoUrl && String(user.photoUrl).trim().length > 0);
  const hasMobile = Boolean(user.mobileNumber && String(user.mobileNumber).trim().length > 0);

  return !hasAge || !hasBio || !hasPhoto || !hasMobile;
};
