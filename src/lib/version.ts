// Version and build information
export const VERSION = 'v0.04a'
export const BUILD_TIME = new Date().toISOString()
export const BUILD_DATE = new Date().toLocaleDateString()
export const BUILD_TIME_LOCAL = new Date().toLocaleString()

// Get short commit-like identifier from build time
export const BUILD_ID = BUILD_TIME.slice(0, 19).replace(/[-:]/g, '').replace('T', '-')

export const getVersionInfo = () => {
  return {
    version: VERSION,
    buildTime: BUILD_TIME,
    buildDate: BUILD_DATE,
    buildTimeLocal: BUILD_TIME_LOCAL,
    buildId: BUILD_ID
  }
}
