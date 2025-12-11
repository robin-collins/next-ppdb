/**
 * @jest-environment node
 *
 * Unit Tests: extractStaffInitials function
 *
 * Tests the staff initials extraction logic from notes following
 * the business rules defined in STAFF_WORKLOAD_UPDATE.md
 */

import { extractStaffInitials } from '@/services/notes.service'

describe('extractStaffInitials', () => {
  describe('Basic extraction', () => {
    it('should extract 3-letter initials at end of note', () => {
      expect(extractStaffInitials('wash and dry SJC')).toBe('SJC')
    })

    it('should extract 2-letter initials at end of note', () => {
      expect(extractStaffInitials('full clip HM')).toBe('HM')
    })

    it('should convert lowercase initials to uppercase', () => {
      expect(extractStaffInitials('wash and dry sjc')).toBe('SJC')
    })

    it('should handle mixed case initials', () => {
      expect(extractStaffInitials('full clip Hm')).toBe('HM')
    })
  })

  describe('Price-before-initials case', () => {
    it('should extract initials before final price token', () => {
      expect(extractStaffInitials('short cut 7 $65 cc')).toBe('CC')
    })

    it('should skip price and extract initials before it', () => {
      expect(extractStaffInitials('full groom $80 TK')).toBe('TK')
    })

    it('should handle multiple prices (use initials before last price)', () => {
      expect(extractStaffInitials('clip $50 AB $60')).toBe('AB')
    })
  })

  describe('Invalid tokens at end', () => {
    it('should skip 4-letter word at end (CLUB case)', () => {
      expect(extractStaffInitials('Full clip long 3 CC $60 CLUB')).toBe('CC')
    })

    it('should skip single letter at end', () => {
      expect(extractStaffInitials('test X')).toBe(null)
    })

    it('should skip 4+ letter words', () => {
      expect(extractStaffInitials('test ABCD')).toBe(null)
    })

    it('should skip numeric tokens', () => {
      expect(extractStaffInitials('test 123')).toBe(null)
    })
  })

  describe('Trailing whitespace handling', () => {
    it('should handle trailing spaces', () => {
      expect(extractStaffInitials('full clip 7 pdl muzzle HM ')).toBe('HM')
    })

    it('should handle multiple trailing spaces', () => {
      expect(extractStaffInitials('wash and dry AB   ')).toBe('AB')
    })

    it('should handle leading and trailing whitespace', () => {
      expect(extractStaffInitials('  wash CD  ')).toBe('CD')
    })
  })

  describe('Edge cases', () => {
    it('should return null for empty string', () => {
      expect(extractStaffInitials('')).toBe(null)
    })

    it('should return null for null input', () => {
      expect(extractStaffInitials(null as unknown as string)).toBe(null)
    })

    it('should return null for undefined input', () => {
      expect(extractStaffInitials(undefined as unknown as string)).toBe(null)
    })

    it('should return null for whitespace-only string', () => {
      expect(extractStaffInitials('   ')).toBe(null)
    })

    it('should return null for note with no initials', () => {
      expect(extractStaffInitials('just a regular note about grooming')).toBe(
        null
      )
    })

    it('should return null when only price token present', () => {
      expect(extractStaffInitials('$55')).toBe(null)
    })

    it('should handle note that ends with only a price', () => {
      expect(extractStaffInitials('full groom $80')).toBe(null)
    })
  })

  describe('Real-world examples from spec', () => {
    it('Example 1: "wash and dry SJC" → SJC', () => {
      expect(extractStaffInitials('wash and dry SJC')).toBe('SJC')
    })

    it('Example 2: "short cut 7 $65 cc" → CC', () => {
      expect(extractStaffInitials('short cut 7 $65 cc')).toBe('CC')
    })

    it('Example 3: "full clip 7 pdl muzzle HM " → HM', () => {
      expect(extractStaffInitials('full clip 7 pdl muzzle HM ')).toBe('HM')
    })

    it('Example 4: "Full clip long 3 CC $60 CLUB" → CC', () => {
      expect(extractStaffInitials('Full clip long 3 CC $60 CLUB')).toBe('CC')
    })
  })
})
