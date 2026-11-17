// Where each role lands after signing in. Shared by the password and AFS sign-in paths.
export function roleHomePath(role: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "communication_officer":
      return "/officer";
    case "editor":
      return "/editor";
    case "social_media_content_creator":
    case "media_correspondent":
    case "principal_investigator":
      return "/creator/my-stories";
    default:
      return "/dashboard";
  }
}
