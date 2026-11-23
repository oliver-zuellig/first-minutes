export type Beacon = {
  readonly id: string
  /** Short name, used as label and in announcements. */
  readonly name: string
  readonly headline: string
  readonly story: string
}

export type ProfileLink = {
  readonly label: string
  readonly href: string
}
