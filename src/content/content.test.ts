import { describe, expect, it } from 'vitest'
import { beacons, getBeacon, playthrough } from './beacons'
import { company, copy } from './copy'

describe('content', () => {
  it('uses three distinct, known beacons', () => {
    expect(new Set(playthrough).size).toBe(3)
    for (const id of playthrough) expect(getBeacon(id).id).toBe(id)
  })

  it('gives every beacon a name, headline and story', () => {
    for (const beacon of beacons) {
      expect(beacon.name).not.toBe('')
      expect(beacon.headline).not.toBe('')
      expect(beacon.story).not.toBe('')
    }
  })

  it('throws on an unknown beacon', () => {
    expect(() => getBeacon('nope')).toThrow()
  })

  it('names the company in the disclaimer and keeps the finale a wish, not a claim', () => {
    expect(copy.footer).toContain(`Not affiliated with or endorsed by ${company}`)
    expect(copy.finale.lines.join(' ')).not.toMatch(/offer|hired|joined|endorse/i)
  })

  it('shows no email address or phone number', () => {
    expect(JSON.stringify({ copy, beacons })).not.toMatch(/@|\+\d|mailto:|tel:/)
  })
})
