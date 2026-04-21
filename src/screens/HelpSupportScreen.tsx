import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Platform,
  StatusBar as RNStatusBar,
  TextInput,
} from 'react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AppGradientHeader, Card } from '../components';
import {
  colors,
  spacing,
  textStyles,
  getFloatingTabBarBottomPadding,
  borderRadius,
  typography,
} from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';

/* ─── Types ──────────────────────────────────────────────────────────── */

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type ContactOption = {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  iconColor: string;
  iconBg: string;
  badge?: string;
};

type QuickLink = {
  id: string;
  icon: string;
  title: string;
  description: string;
  iconColor: string;
  iconBg: string;
};

/* ─── Static data ────────────────────────────────────────────────────── */

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq_1',
    question: 'How do I add a new child to my account?',
    answer:
      'Go to the Profile tab, scroll to the "My children" section, and tap the + button. Fill in the child\'s name, age, class, and school to complete the registration.',
  },
  {
    id: 'faq_2',
    question: 'How are daily ratings calculated?',
    answer:
      'Daily ratings are based on the aspects you rate for your child each day. Each aspect is scored 1–5, and the overall score is computed as a weighted average across all rated aspects.',
  },
  {
    id: 'faq_3',
    question: 'Can I share progress with my child\'s teacher?',
    answer:
      'Yes! Go to Privacy & Security settings and enable "Share Progress". Your child\'s teacher can then view weekly progress summaries if they are connected to your school.',
  },
  {
    id: 'faq_4',
    question: 'How do I change my security PIN?',
    answer:
      'Navigate to Privacy & Security in your Profile settings. Under the Security section, tap "Change PIN" and follow the prompts to set a new 4-digit PIN.',
  },
  {
    id: 'faq_5',
    question: 'What is the SDS score?',
    answer:
      'The Strengths & Development Score (SDS) is a comprehensive metric that measures your child\'s overall wellbeing across multiple dimensions including emotional, social, and academic growth.',
  },
];

const CONTACT_OPTIONS: ContactOption[] = [
  {
    id: 'live_chat',
    icon: 'chat',
    title: 'Live Chat',
    subtitle: 'Chat with our support team',
    iconColor: colors.primary,
    iconBg: colors.lavenderSoft,
    badge: 'Online',
  },
  {
    id: 'email',
    icon: 'email',
    title: 'Email Support',
    subtitle: 'support@kovariya.com',
    iconColor: colors.info,
    iconBg: colors.skySoft,
  },
  {
    id: 'phone',
    icon: 'phone',
    title: 'Call Us',
    subtitle: '+1 (800) 555-KOVA',
    iconColor: colors.growth,
    iconBg: colors.mintSoft,
  },
];

const QUICK_LINKS: QuickLink[] = [
  {
    id: 'getting_started',
    icon: 'play-circle-filled',
    title: 'Getting Started Guide',
    description: 'Learn the basics of Kovariya',
    iconColor: colors.primary,
    iconBg: colors.lavenderSoft,
  },
  {
    id: 'video_tutorials',
    icon: 'ondemand-video',
    title: 'Video Tutorials',
    description: 'Step-by-step walkthrough videos',
    iconColor: colors.accent,
    iconBg: colors.peachSoft,
  },
  {
    id: 'community',
    icon: 'forum',
    title: 'Community Forum',
    description: 'Connect with other parents',
    iconColor: colors.growth,
    iconBg: colors.mintSoft,
  },
  {
    id: 'report_bug',
    icon: 'bug-report',
    title: 'Report a Bug',
    description: 'Help us fix issues quickly',
    iconColor: '#E85D5D',
    iconBg: '#FFECEC',
  },
];

/* ─── FAQ Accordion ──────────────────────────────────────────────────── */

function FAQRow({
  item,
  expanded,
  isLast,
  onToggle,
  index,
}: {
  item: FAQItem;
  expanded: boolean;
  isLast: boolean;
  onToggle: () => void;
  index: number;
}) {
  return (
    <Animated.View
      entering={FadeInRight.delay(60 * index).springify().damping(20).stiffness(180)}
    >
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          s.faqRow,
          !isLast && s.faqRowBorder,
          pressed && s.pressedOpacity,
        ]}
        accessibilityRole="button"
        accessibilityLabel={item.question}
      >
        <View style={s.faqHeader}>
          <View style={s.faqQuestionOrb}>
            <Text style={s.faqQuestionOrbText}>Q</Text>
          </View>
          <Text style={s.faqQuestion}>{item.question}</Text>
          <Icon
            name={expanded ? 'expand-less' : 'expand-more'}
            size={24}
            color={colors.textMuted}
          />
        </View>
        {expanded && (
          <View style={s.faqAnswerWrap}>
            <Text style={s.faqAnswer}>{item.answer}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

/* ─── Main Screen ────────────────────────────────────────────────────── */

const HelpSupportScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const scrollBottomPad = useMemo(
    () => getFloatingTabBarBottomPadding(insets.bottom),
    [insets.bottom]
  );

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_ITEMS;
    const q = searchQuery.toLowerCase();
    return FAQ_ITEMS.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      return () => {
        setStatusBarStyle('dark');
        if (Platform.OS === 'android') {
          RNStatusBar.setTranslucent(false);
          RNStatusBar.setBackgroundColor(colors.background);
        }
      };
    }, [])
  );

  return (
    <SafeAreaView style={s.root} edges={['left', 'right', 'bottom']}>
      <AppGradientHeader
        title="Help & Support"
        subtitle="We're here for you"
        leadingMode="back"
      />

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scrollContent, { paddingBottom: scrollBottomPad }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Search bar ────────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.springify().damping(18).stiffness(220)}>
          <Card variant="elevated" style={s.searchCard}>
            <View style={s.searchRow}>
              <Icon name="search" size={22} color={colors.textMuted} />
              <TextInput
                style={s.searchInput}
                placeholder="Search help articles..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery('')}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                >
                  <Icon name="close" size={20} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          </Card>
        </Animated.View>

        {/* ── Contact options ───────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(80).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Contact</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.sm }]}>
              Get in touch
            </Text>
            <View style={s.contactGrid}>
              {CONTACT_OPTIONS.map((opt, i) => (
                <Animated.View
                  key={opt.id}
                  entering={FadeInDown.delay(60 * i).springify().damping(18).stiffness(200)}
                >
                  <Pressable
                    style={({ pressed }) => [
                      s.contactChip,
                      pressed && s.pressedOpacity,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={opt.title}
                  >
                    <View style={[s.contactChipIcon, { backgroundColor: opt.iconBg }]}>
                      <Icon name={opt.icon} size={24} color={opt.iconColor} />
                    </View>
                    <Text style={s.contactChipTitle}>{opt.title}</Text>
                    <Text style={s.contactChipSub}>{opt.subtitle}</Text>
                    {opt.badge && (
                      <View style={s.onlineBadge}>
                        <View style={s.onlineDot} />
                        <Text style={s.onlineBadgeText}>{opt.badge}</Text>
                      </View>
                    )}
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Card>
        </Animated.View>

        {/* ── FAQ ───────────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(160).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <View style={s.sectionHeaderRow}>
              <View>
                <Text style={s.sectionEyebrow}>FAQ</Text>
                <Text style={s.sectionTitle}>Common questions</Text>
              </View>
              <View style={s.faqCountBadge}>
                <Text style={s.faqCountText}>{filteredFaqs.length}</Text>
              </View>
            </View>
            {filteredFaqs.length === 0 ? (
              <View style={s.emptyState}>
                <Icon name="search-off" size={40} color={colors.textMuted} />
                <Text style={s.emptyText}>No results found</Text>
                <Text style={s.emptySubtext}>Try different search terms</Text>
              </View>
            ) : (
              filteredFaqs.map((faq, i) => (
                <FAQRow
                  key={faq.id}
                  item={faq}
                  index={i}
                  expanded={expandedFaq === faq.id}
                  isLast={i === filteredFaqs.length - 1}
                  onToggle={() =>
                    setExpandedFaq((prev) => (prev === faq.id ? null : faq.id))
                  }
                />
              ))
            )}
          </Card>
        </Animated.View>

        {/* ── Quick links ───────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(240).springify().damping(18).stiffness(220)}
        >
          <Card variant="elevated" style={s.sectionCard}>
            <Text style={s.sectionEyebrow}>Resources</Text>
            <Text style={[s.sectionTitle, { marginBottom: spacing.sm }]}>
              Quick links
            </Text>
            {QUICK_LINKS.map((link, i) => (
              <Pressable
                key={link.id}
                style={({ pressed }) => [
                  s.linkRow,
                  i < QUICK_LINKS.length - 1 && s.linkRowBorder,
                  pressed && s.pressedOpacity,
                ]}
                accessibilityRole="button"
                accessibilityLabel={link.title}
              >
                <View style={[s.iconOrb, { backgroundColor: link.iconBg }]}>
                  <Icon name={link.icon} size={22} color={link.iconColor} />
                </View>
                <View style={s.linkText}>
                  <Text style={s.linkTitle}>{link.title}</Text>
                  <Text style={s.linkDesc}>{link.description}</Text>
                </View>
                <Icon name="chevron-right" size={22} color={colors.textMuted} />
              </Pressable>
            ))}
          </Card>
        </Animated.View>

        {/* ── Support hours ─────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(300).springify().damping(18).stiffness(220)}
        >
          <View style={s.footerNote}>
            <Icon name="schedule" size={16} color={colors.textMuted} />
            <Text style={s.footerNoteText}>
              Live support available Mon–Fri, 9 AM – 6 PM IST. Email support is available 24/7.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

/* ─── Styles ─────────────────────────────────────────────────────────── */

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },

  /* Search */
  searchCard: { marginVertical: spacing.xs },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
  },
  searchInput: {
    flex: 1, fontFamily: typography.fontFamily.primary,
    fontSize: typography.fontSize.base, color: colors.ink,
    paddingVertical: 0,
  },

  /* Sections */
  sectionCard: { marginVertical: spacing.xs },
  sectionHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.md,
  },
  sectionEyebrow: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.xs,
    fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase',
    color: colors.textMuted, marginBottom: spacing.sm,
  },
  sectionTitle: { ...textStyles.headingMedium, fontWeight: '800', color: colors.ink },

  /* Contact grid */
  contactGrid: { flexDirection: 'row', gap: spacing.sm },
  contactChip: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.large, backgroundColor: colors.surfaceMuted,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, position: 'relative',
    minWidth: 0,
  },
  contactChipIcon: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm,
  },
  contactChipTitle: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.sm,
    fontWeight: '700', color: colors.ink, marginBottom: 2, textAlign: 'center',
  },
  contactChipSub: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.xs - 1,
    fontWeight: '500', color: colors.textMuted, textAlign: 'center',
  },
  onlineBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: borderRadius.full, backgroundColor: colors.mintSoft,
  },
  onlineDot: {
    width: 7, height: 7, borderRadius: 4, backgroundColor: colors.growth,
  },
  onlineBadgeText: {
    fontFamily: typography.fontFamily.primary, fontSize: 10,
    fontWeight: '700', color: colors.growth,
  },

  /* FAQ */
  faqCountBadge: {
    backgroundColor: colors.lavenderSoft, paddingHorizontal: spacing.sm + 2,
    paddingVertical: 6, borderRadius: borderRadius.full,
    borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(124, 106, 232, 0.18)',
  },
  faqCountText: {
    fontFamily: typography.fontFamily.primary, fontSize: typography.fontSize.xs,
    fontWeight: '800', color: colors.primaryDark,
  },
  faqRow: { paddingVertical: spacing.md },
  faqRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  faqQuestionOrb: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.lavenderSoft, alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  faqQuestionOrbText: {
    fontFamily: typography.fontFamily.primary, fontSize: 13,
    fontWeight: '800', color: colors.primaryDark,
  },
  faqQuestion: {
    ...textStyles.bodyLarge, fontWeight: '600', color: colors.ink, flex: 1, marginRight: spacing.xs,
  },
  faqAnswerWrap: {
    marginTop: spacing.sm, marginLeft: 30 + spacing.sm,
    paddingLeft: spacing.md, borderLeftWidth: 2, borderLeftColor: colors.lavenderSoft,
  },
  faqAnswer: {
    ...textStyles.bodyMedium, color: colors.textSecondary, fontWeight: '500', lineHeight: 22,
  },

  /* Empty */
  emptyState: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyText: { ...textStyles.bodyLarge, fontWeight: '700', color: colors.ink, marginTop: spacing.md },
  emptySubtext: { ...textStyles.caption, color: colors.textMuted, marginTop: spacing.xs },

  /* Quick links */
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  linkRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconOrb: {
    width: 44, height: 44, borderRadius: borderRadius.medium,
    alignItems: 'center', justifyContent: 'center', marginRight: spacing.md,
  },
  linkText: { flex: 1, minWidth: 0, marginRight: spacing.sm },
  linkTitle: { ...textStyles.bodyLarge, fontWeight: '700', color: colors.ink },
  linkDesc: { ...textStyles.caption, color: colors.textSecondary, fontWeight: '500', marginTop: 2 },

  /* Footer */
  footerNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm,
    paddingVertical: spacing.lg, paddingHorizontal: spacing.xs,
  },
  footerNoteText: { ...textStyles.caption, color: colors.textMuted, fontWeight: '500', flex: 1, lineHeight: 18 },

  pressedOpacity: { opacity: 0.88 },
});

export default HelpSupportScreen;
