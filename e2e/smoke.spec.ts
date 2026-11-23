import { expect, test, type Page } from '@playwright/test'
import { copy } from '../src/content/copy'

const BEACON_COUNT = 3

async function takeOff(page: Page) {
  await page.getByRole('button', { name: copy.actions.dispatch }).click()
  for (const label of Object.values(copy.preflight.checks))
    await page.getByRole('button', { name: label }).click()
  await page.getByRole('button', { name: copy.actions.takeOff }).click()
}

/** Autopilot through all beacons to the winch, then lower the AED. */
async function flyMission(page: Page) {
  await takeOff(page)
  await page.getByRole('button', { name: copy.actions.autopilot }).click()
  for (let i = 0; i < BEACON_COUNT; i++) {
    const card = page.getByRole('article')
    await expect(card).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: copy.actions.continueFlight }).click()
  }
  const lower = page.getByRole('button', { name: copy.actions.lower })
  await expect(lower).toBeVisible({ timeout: 15_000 })
  while (await lower.isVisible()) await lower.click().catch(() => {})
}

async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

test('plays the full mission on desktop and replays', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('heading', { level: 1, name: copy.title })).toBeVisible()

  await flyMission(page)
  await expect(page.getByRole('heading', { name: copy.finale.headline })).toBeVisible()
  for (const line of copy.finale.lines)
    await expect(page.getByText(line, { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: copy.actions.viewCode })).toBeVisible()

  await page.getByRole('banner').getByRole('button', { name: copy.actions.meetOliver }).click()
  const profile = page.getByRole('dialog')
  await expect(profile).toBeVisible()
  // profile.ts imports the photo, which Node cannot load, so the close label is repeated here.
  await profile.getByRole('button', { name: 'Close' }).click()
  await expect(profile).toBeHidden()

  await page.getByRole('button', { name: copy.actions.replay }).click()
  await expect(page.getByRole('button', { name: copy.actions.dispatch })).toBeVisible()
})

test('fits a 360 px phone without horizontal scroll', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 })
  await page.goto('./')
  await expectNoHorizontalScroll(page)

  await takeOff(page)
  await expect(page.getByRole('button', { name: copy.actions.climb })).toBeInViewport()
  await expectNoHorizontalScroll(page)
})
