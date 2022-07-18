import { render, screen } from '@testing-library/react'

const ICONS = [
  'Add',
  'ArrowBottom',
  'ArrowBottom1',
  'ArrowBottom2',
  'ArrowBottom3',
  'ArrowLeft',
  'ArrowLeft1',
  'ArrowRight',
  'ArrowRight1',
  'ArrowRight2',
  'ArrowRight3',
  'ArrowSwap',
  'ArrowTop',
  'ArrowTop1',
  'ArrowTop2',
  'ArrowTop3',
  'Award',
  'Bag',
  'Bag2',
  'Battery',
  'Calendar',
  'CallCalling',
  'CallMuted',
  'CallSlash',
  'Camera',
  'CameraSlash',
  'Card',
  'Charge',
  'Chart',
  'ChartDark',
  'Check',
  'CheckRound',
  'Checklist',
  'Clock',
  'Close',
  'CloseCross',
  'Cloud',
  'Cloud1',
  'CloudDrizzle',
  'CloudLightning',
  'CmdKey',
  'Comparison',
  'Copy',
  'Cpu',
  'Cup',
  'Discovery',
  'Docker',
  'Document',
  'Dollar',
  'Edit',
  'Edit1',
  'Edit2',
  'Edit3',
  'Export',
  'Eye',
  'EyeSlash',
  'Filter',
  'Folder',
  'Gallery',
  'Gps',
  'Grid',
  'Grid2',
  'Grid3',
  'Headphone',
  'HeadphoneSlash',
  'Heart',
  'Home',
  'Home2',
  'Info',
  'Info1',
  'Instagram',
  'Loading',
  'Loading1',
  'Location',
  'Lock',
  'Lock1',
  'Marking',
  'Menu',
  'Menu1',
  'Message',
  'Message2',
  'Message3',
  'Message4',
  'Message5',
  'Mic',
  'Minus',
  'Mobile',
  'MoneroSignet',
  'Monitor',
  'Moon',
  'More',
  'More1',
  'Mouse',
  'Note',
  'Note2',
  'Note3',
  'NoteAdd',
  'NoteCheck',
  'NoteDelete',
  'NoteMinus',
  'Notification',
  'Notification1',
  'Notification2',
  'Notification3',
  'Phone',
  'Play',
  'Play1',
  'Plus',
  'Presentation',
  'Presentation1',
  'Printer',
  'Programming',
  'Question',
  'Report',
  'Reserve',
  'RotateLeft',
  'RotateRight',
  'Saved',
  'Scan',
  'Scan2',
  'Scan3',
  'Search',
  'Send',
  'Setting',
  'Setting2',
  'Setting3',
  'Shield',
  'ShieldCheck',
  'ShieldVulnerable',
  'ShoppingCart',
  'Smiley',
  'SmileyNot',
  'Sort',
  'Star',
  'Star1',
  'Status',
  'Sun',
  'Sunrise',
  'TariLaunchpadLogo',
  'TariLogo',
  'TariSignet',
  'TariSignetGradient',
  'TBotBase',
  'TBotDots',
  'TBotHearts',
  'TBotHeartsMonero',
  'TBotLoading',
  'TBotSearch',
  'Text',
  'Tick',
  'Todo',
  'Trash',
  'Trash2',
  'TurnOff',
  'Tv',
  'TwoUser',
  'Unlock',
  'User',
  'UserPlus',
  'UserScan',
  'Video',
  'VolumeCross',
  'VolumeHigh',
  'VolumeLow',
  'VolumeMute',
  'VolumeSlash',
  'Wallet',
  'WinKey',
  'Work',
  'ZoomIn',
  'ZoomOut',
]

describe('Icons', () => {
  ICONS.forEach(icon => {
    it(`renders ${icon} icon without crashing`, async () => {
      const ComponentToRender = (await import(`./${icon}`)).default
      render(<ComponentToRender />)

      const el = screen.getByTestId(`svg-${icon.toLowerCase()}`)
      expect(el).toBeInTheDocument()
    })
  })
})
