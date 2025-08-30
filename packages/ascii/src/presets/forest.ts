import { generateForestFrames, generateLogsFrames, generate3DForestFrames } from '../generators'
import { TreeType } from '../engine/types'

export const FOREST_PRESETS = {
  hero: generateForestFrames(120, 40, 60, {
    treeTypes: [TreeType.PINE, TreeType.OAK, TreeType.BIRCH],
    windSpeed: 1,
    density: 0.3,
    perspective: true
  }),
  
  minimal: generateForestFrames(80, 20, 30, {
    treeTypes: [TreeType.PINE],
    windSpeed: 0.5,
    density: 0.2,
    perspective: false
  }),
  
  dense: generateForestFrames(120, 40, 60, {
    treeTypes: [TreeType.PINE, TreeType.OAK, TreeType.BIRCH, TreeType.WILLOW],
    windSpeed: 1.5,
    density: 0.5,
    perspective: true
  }),
  
  logs: generateLogsFrames(100, 30, 60, {
    logCount: 12,
    floating: true,
    rotation: true,
    moss: true,
    water: false
  }),
  
  floatingLogs: generateLogsFrames(100, 30, 60, {
    logCount: 8,
    floating: true,
    rotation: true,
    moss: true,
    water: true
  }),
  
  stackedLogs: generateLogsFrames(100, 30, 60, {
    logCount: 16,
    floating: false,
    stacked: true,
    rotation: false,
    moss: true,
    water: false
  }),
  
  forest3d: generate3DForestFrames(120, 40, 60, {
    depth: 20,
    perspective: true
  })
}

export const getForestPreset = (name: keyof typeof FOREST_PRESETS) => {
  return FOREST_PRESETS[name]
}