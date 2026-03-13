export default (sp: any) => {
  if (!sp || !sp.name) return sp;

  const name = sp.name.includes(':') ? sp.name.split(':')[1] : sp.name;
  return {
    ...sp,
    name
  };
};
