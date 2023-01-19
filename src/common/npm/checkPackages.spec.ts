import { checkPackages } from './checkPackages'

describe('common/npm/checkPackages', () => {
  describe('checkPackages', () => {
    const fn = checkPackages

    test('basic test 1', () => {
      const onGetResultResults: any[] = []

      const result = fn(['react', 'react-dom'], {
        onGetResult: r => onGetResultResults.push(r),
      })

      expect(result.hasErrors).toBe(false)
      expect(Object.keys(result.results)).toEqual(['react', 'react-dom'])
      expect(onGetResultResults.length).toBe(2)
    })

    test('basic test 2', () => {
      const onGetResultResults: any[] = []

      const result = fn(['not-a-package', 'react-dom'], {
        onGetResult: r => onGetResultResults.push(r),
      })

      expect(result.hasErrors).toBe(true)
      expect(Object.keys(result.results)).toEqual(['not-a-package', 'react-dom'])
      expect(onGetResultResults.length).toBe(2)
    })

    test('basic test 3', () => {
      const onGetResultResults: any[] = []

      const result = fn(['not-a-package', 'react-dom'], {
        stopOnError: true,
        onGetResult: r => onGetResultResults.push(r),
      })

      expect(result.hasErrors).toBe(true)
      expect(Object.keys(result.results)).toEqual(['not-a-package'])
      expect(onGetResultResults.length).toBe(1)
    })
  })
})
