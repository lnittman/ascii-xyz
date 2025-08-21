import * as React from "react"

const MOBILE_BREAKPOINT = 1024; 

// Create a resource that can be used with Suspense
function createMobileResource() {
  let status = "pending"
  let result: boolean
  
  const promise = new Promise<boolean>((resolve) => {
    // Only run this in client environment
    if (typeof window === "undefined") {
      resolve(false)
      return
    }
    
    // Immediately resolve with current value
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT
    resolve(isMobile)
    
    // Set up the media query listener for future changes
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", () => {
      result = window.innerWidth < MOBILE_BREAKPOINT
      status = "success"
    })
  }).then((value) => {
    status = "success"
    result = value
    return value
  })
  
  return {
    read() {
      if (status === "pending") throw promise
      if (status === "error") throw result
      return result
    }
  }
}

// Only create the resource once
const mobileResource = typeof window !== "undefined" ? createMobileResource() : null

// Traditional implementation for backward compatibility
export interface IsMobileResult {
  isMobile: boolean
  ready: boolean
}

export function useIsMobile(): IsMobileResult {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  // Return an object with isMobile (with a default value of false) and ready (whether we've detected)
  return {
    isMobile: !!isMobile,
    ready: isMobile !== undefined
  }
}

// New Suspense-compatible hook
export function useIsMobileSuspense(): boolean {
  // Early return for SSR
  if (typeof window === "undefined" || !mobileResource) {
    return false
  }
  
  return mobileResource.read()
}
