import { useEffect, useRef, useState } from 'react'
import { useSpring } from 'react-spring'

import Text from '../Text'

import {
  TabsContainer,
  Tab,
  TabOptions,
  TabContent,
  TabSelectedBorder,
  FontWeightCompensation,
} from './styles'
import { TabsProps } from './types'

/**
 * Tabs component
 *
 * @TODO add details on how to compose the tab content to make the 'selected' styling work properly
 *
 * @param {TabProp[]} tabs - the list of tabs.
 * @param {string} selected - the id of the selected tab. It has to match the `id` prop of the tab.
 * @param {(val: string) => void} onSelect - on tab click.
 *
 * @typedef TabProp
 * @param {string} id - unique identifier of the tab
 * @param {ReactNode} content - the tab header content
 */
const Tabs = ({ tabs, selected, onSelect }: TabsProps) => {
  const tabsRefs = useRef<(HTMLButtonElement | null)[]>([])
  // Needs to re-render the component twice on the initial mount,
  // because on first rendering, it adds tabs to the DOM, and on
  // the second render, it can calculate correct values for bolded fonts.
  // So the `initialized` is an integer incremented from 0 to 2
  const [initialized, setInitialzed] = useState(0)

  useEffect(() => {
    tabsRefs.current = tabsRefs.current.slice(0, tabs.length)
  }, [tabs])

  useEffect(() => {
    if (initialized < 2) {
      setInitialzed(initialized + 1)
    }
  }, [initialized])

  const selectedIndex = tabs.findIndex(t => t.id === selected)
  let width = 0
  let left = 0
  let totalWidth = 0

  if (selectedIndex > -1) {
    if (
      tabsRefs &&
      tabsRefs.current &&
      tabsRefs.current.length > selectedIndex
    ) {
      tabsRefs.current.forEach((el, index) => {
        if (el) {
          if (index < selectedIndex) {
            left = left + el.offsetWidth
          } else if (index === selectedIndex) {
            width = el.offsetWidth
          }
          totalWidth = totalWidth + el.offsetWidth
        }
      })
    }
  }

  const activeBorder = useSpring({
    to: { left: left, width: width },
    config: { duration: 100 },
  })

  return (
    <TabsContainer>
      <TabOptions>
        {tabs.map((tab, index) => (
          <Tab
            key={`tab-${index}`}
            ref={el => (tabsRefs.current[index] = el)}
            onClick={() => onSelect(tab.id)}
          >
            <FontWeightCompensation>
              <Text type='defaultHeavy'>{tab.content}</Text>
            </FontWeightCompensation>
            <TabContent selected={selected === tab.id}>
              <Text
                type={selected === tab.id ? 'defaultHeavy' : 'defaultMedium'}
              >
                {tab.content}
              </Text>
            </TabContent>
          </Tab>
        ))}
      </TabOptions>
      <TabSelectedBorder
        style={{
          ...activeBorder,
        }}
      />
    </TabsContainer>
  )
}

export default Tabs
