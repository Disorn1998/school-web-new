export const CLASS_LEVELS = [
  { id: 1, name: "Kindergarten" },
  { id: 2, name: "Pre-Prep" },
  { id: 3, name: "Prep" },
  { id: 4, name: "Y1" },
  { id: 5, name: "Y2" },
  { id: 6, name: "Y3" },
  { id: 7, name: "Y4" },
  { id: 8, name: "Y5" },
  { id: 9, name: "Y6" },
  { id: 10, name: "Y7" },
  { id: 11, name: "Y8" },
  { id: 12, name: "Y9" },
  { id: 13, name: "Y10" },
  { id: 14, name: "Y11" },
  { id: 15, name: "Y12" }
];

export const getClassName = (id) => {
  if (!id) return "Unknown Class";
  const level = CLASS_LEVELS.find(c => c.id === parseInt(id));
  return level ? level.name : `Year ${id}`;
};
