export default (sp: any) => {
  const name = sp.shipping_profile.name.includes(":")
    ? sp.shipping_profile.name.split(":")[1]
    : sp.shipping_profile.name
  return {
    ...sp,
    shipping_profile: {
      ...sp.shipping_profile,
      name,
    },
  }
}
