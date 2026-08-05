/// <reference types="node" />

import 'dotenv/config';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, PolicyStatus, Role } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || '',
});
const prisma = new PrismaClient({ adapter });

const stableUuid = (key: string): string => {
  const hash = createHash('sha256').update(`diffusion-node:${key}`).digest('hex');
  const variant = ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0');

  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `5${hash.slice(13, 16)}`,
    `${variant}${hash.slice(18, 20)}`,
    hash.slice(20, 32),
  ].join('-');
};

const date = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

const hashApiKey = (apiKey: string): string => createHash('sha256').update(apiKey).digest('hex');

const seedId = (key: string): string => stableUuid(key);

const policySourceUrl = {
  'pol-2022-oct':
    'https://www.federalregister.gov/documents/2022/10/13/2022-21658/implementation-of-additional-export-controls-certain-advanced-computing-and-semiconductor',
  'pol-2023-oct':
    'https://www.federalregister.gov/documents/2023/10/25/2023-23055/implementation-of-additional-export-controls-certain-advanced-computing-items-supercomputer-and',
  'pol-2024-dec-fdpr':
    'https://www.federalregister.gov/documents/2024/12/05/2024-28270/foreign-produced-direct-product-rule-additions-and-refinements-to-controls-for-advanced-computing',
  'pol-2024-dec-entitylist':
    'https://www.federalregister.gov/documents/2024/12/05/2024-28267/additions-and-modifications-to-the-entity-list-removals-from-the-validated-end-user-veu-program',
  'pol-2025-jan-diffusion':
    'https://www.federalregister.gov/documents/2025/01/15/2025-00636/framework-for-artificial-intelligence-diffusion',
  'pol-2025-jan-duediligence':
    'https://www.federalregister.gov/documents/2025/01/16/2025-00711/implementation-of-additional-due-diligence-measures-for-advanced-computing-integrated-circuits',
  'pol-2025-jan-entitylist':
    'https://www.federalregister.gov/documents/2025/01/16/2025-00480/additions-to-the-entity-list',
  'pol-2025-sep-entitylist':
    'https://www.federalregister.gov/documents/2025/09/16/2025-17893/additions-and-revisions-to-the-entity-list',
  'pol-2026-jan-licenserevision':
    'https://www.federalregister.gov/documents/2026/01/15/2026-00789/revision-to-license-review-policy-for-advanced-computing-commodities',
} as const;

const policies = [
  {
    key: 'pol-2022-oct',
    title:
      'Implementation of Additional Export Controls: Certain Advanced Computing and Semiconductor Manufacturing Items; Supercomputer and Semiconductor End Use; Entity List Modification',
    summary:
      'Foundational BIS controls for advanced computing chips, semiconductor manufacturing equipment, supercomputer end uses, and related China-focused Entity List changes.',
    controlNumber: '87 FR 62186 / RIN 0694-AI94',
    effectiveDate: date('2022-10-07'),
    status: PolicyStatus.SUPERSEDED,
    publishedDate: date('2022-10-13'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2022-10-13/pdf/2022-21658.pdf',
  },
  {
    key: 'pol-2023-oct',
    title:
      'Implementation of Additional Export Controls: Certain Advanced Computing Items; Supercomputer and Semiconductor End Use; Updates and Corrections',
    summary:
      'Refines the 2022 advanced computing rule by replacing chip interconnect thresholds with Total Processing Performance and tightening Macau and China controls.',
    controlNumber: '88 FR 73458 / RIN 0694-AI94',
    effectiveDate: date('2023-11-17'),
    status: PolicyStatus.ACTIVE,
    publishedDate: date('2023-10-25'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2023-10-25/pdf/2023-23055.pdf',
  },
  {
    key: 'pol-2024-dec-fdpr',
    title:
      'Foreign-Produced Direct Product Rule Additions, and Refinements to Controls for Advanced Computing and Semiconductor Manufacturing Items',
    summary:
      'Adds and refines foreign direct product rules, high-bandwidth memory controls, and advanced semiconductor manufacturing restrictions.',
    controlNumber: '89 FR 96790 / RIN 0694-AJ74',
    effectiveDate: date('2024-12-05'),
    status: PolicyStatus.ACTIVE,
    publishedDate: date('2024-12-05'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2024-12-05/pdf/2024-28270.pdf',
  },
  {
    key: 'pol-2024-dec-entitylist',
    title:
      'Additions and Modifications to the Entity List; Removals From the Validated End-User (VEU) Program',
    summary:
      'Adds roughly 140 entities to the Entity List and removes or modifies certain Validated End-User authorizations tied to semiconductor supply chains.',
    controlNumber: '89 FR 96830 / RIN 0694-AJ77',
    effectiveDate: date('2024-12-05'),
    status: PolicyStatus.ACTIVE,
    publishedDate: date('2024-12-05'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2024-12-05/pdf/2024-28267.pdf',
  },
  {
    key: 'pol-2025-jan-diffusion',
    title: 'Framework for Artificial Intelligence Diffusion',
    summary:
      'Creates a tiered global licensing framework for advanced AI chips and introduces controls on closed-weight AI model weights above a high compute threshold.',
    controlNumber: '90 FR 4544 / RIN 0694-AJ90',
    effectiveDate: date('2025-01-13'),
    status: PolicyStatus.CONTESTED,
    publishedDate: date('2025-01-15'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2025-01-15/pdf/2025-00636.pdf',
  },
  {
    key: 'pol-2025-jan-duediligence',
    title:
      'Implementation of Additional Due Diligence Measures for Advanced Computing Integrated Circuits; Amendments and Clarifications; and Extension of Comment Period',
    summary:
      'Adds due diligence measures for advanced computing integrated circuits and clarifies obligations around restricted destinations and parties.',
    controlNumber: '90 FR 5298 / RIN 0694-AJ98',
    effectiveDate: date('2025-01-16'),
    status: PolicyStatus.ACTIVE,
    publishedDate: date('2025-01-16'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2025-01-16/pdf/2025-00711.pdf',
  },
  {
    key: 'pol-2025-jan-entitylist',
    title: 'Additions to the Entity List',
    summary:
      'Adds advanced-computing and semiconductor-related parties to the Entity List, including China-linked entities and entities in Singapore.',
    controlNumber: '90 FR 4621 / RIN 0694-AK01',
    effectiveDate: date('2025-01-16'),
    status: PolicyStatus.ACTIVE,
    publishedDate: date('2025-01-16'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2025-01-16/pdf/2025-00480.pdf',
  },
  {
    key: 'pol-2025-sep-entitylist',
    title: 'Additions and Revisions to the Entity List',
    summary:
      'Expands and revises Entity List coverage for advanced-computing and semiconductor-linked entities across China and additional jurisdictions.',
    controlNumber: '90 FR 44496 / RIN 0694-AK26',
    effectiveDate: date('2025-09-12'),
    status: PolicyStatus.ACTIVE,
    publishedDate: date('2025-09-16'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2025-09-16/pdf/2025-17893.pdf',
  },
  {
    key: 'pol-2026-jan-licenserevision',
    title: 'Revision to License Review Policy for Advanced Computing Commodities',
    summary:
      'Revises license review policy for a defined class of advanced computing commodities destined for China and Macau from denial toward case-by-case review.',
    controlNumber: '91 FR 1684 / RIN 0694-AK43',
    effectiveDate: date('2026-01-15'),
    status: PolicyStatus.ACTIVE,
    publishedDate: date('2026-01-15'),
    documentUrl: 'https://www.govinfo.gov/content/pkg/FR-2026-01-15/pdf/2026-00789.pdf',
  },
] as const;

const users = [
  { key: 'user-admin', email: 'admin@diffusionnode.io', role: Role.ADMIN },
  { key: 'user-developer', email: 'developer@diffusionnode.io', role: Role.DEVELOPER },
] as const;

const technologyCategories = [
  { key: 'cat-semi', name: 'Semiconductors', isActiveInV1: true },
  { key: 'cat-ai', name: 'Artificial Intelligence', isActiveInV1: true },
  { key: 'cat-quantum', name: 'Quantum Computing', isActiveInV1: false },
  { key: 'cat-cloud', name: 'Cloud Computing', isActiveInV1: false },
  { key: 'cat-sw', name: 'Software and EDA', isActiveInV1: false },
] as const;

const technologies = [
  {
    key: 'tech-01',
    name: 'Advanced Logic Nodes (<16nm / 3D Tri-Gate)',
    description: 'Sub-16/14nm non-planar logic architectures.',
    categoryKey: 'cat-semi',
  },
  {
    key: 'tech-02',
    name: 'High-Bandwidth Memory (HBM2E/HBM3/HBM3E)',
    description: 'Stacked DRAM dies linked through silicon interposers for AI processing.',
    categoryKey: 'cat-semi',
  },
  {
    key: 'tech-03',
    name: 'Extreme Ultraviolet (EUV) Lithography',
    description: '13.5nm wavelength photolithography tools.',
    categoryKey: 'cat-semi',
  },
  {
    key: 'tech-04',
    name: 'Deep Ultraviolet (DUV) Immersion Lithography',
    description: '193nm immersion photolithography systems, including ASML NXT-series tools.',
    categoryKey: 'cat-semi',
  },
  {
    key: 'tech-05',
    name: 'Gate-All-Around (GAAFET) Transistors',
    description: 'Nanosheet transistor structures used in sub-3nm nodes.',
    categoryKey: 'cat-semi',
  },
  {
    key: 'tech-06',
    name: 'AI Training Accelerators (ECCN 3A090)',
    description:
      'High-performance GPUs and accelerators exceeding Total Processing Performance thresholds.',
    categoryKey: 'cat-ai',
  },
  {
    key: 'tech-07',
    name: 'Supercomputer Interconnects',
    description: 'High-speed optical and copper interconnects for exascale clusters.',
    categoryKey: 'cat-ai',
  },
  {
    key: 'tech-08',
    name: 'Electronic Design Automation (EDA) Software',
    description: 'ECAD software for GAAFET and advanced chiplet design.',
    categoryKey: 'cat-sw',
  },
  {
    key: 'tech-09',
    name: 'AI Model Weights (Closed-Weight, >10^26 FLOP, ECCN 4E091)',
    description:
      "Trained parameters of closed-weight AI models above the AI Diffusion Rule's compute threshold.",
    categoryKey: 'cat-ai',
  },
] as const;

const countries = [
  { key: 'country-usa', name: 'United States', isoCode: 'USA', tierClassification: 'Group A:5' },
  { key: 'country-chn', name: 'China', isoCode: 'CHN', tierClassification: 'Group D:5' },
  { key: 'country-nld', name: 'Netherlands', isoCode: 'NLD', tierClassification: 'Group A:5' },
  { key: 'country-jpn', name: 'Japan', isoCode: 'JPN', tierClassification: 'Group A:5' },
  { key: 'country-kor', name: 'South Korea', isoCode: 'KOR', tierClassification: 'Group A:5' },
  { key: 'country-twn', name: 'Taiwan', isoCode: 'TWN', tierClassification: 'Group A:5' },
  { key: 'country-mac', name: 'Macau', isoCode: 'MAC', tierClassification: 'Group D:5' },
  { key: 'country-sgp', name: 'Singapore', isoCode: 'SGP', tierClassification: 'Group A:6' },
  { key: 'country-ind', name: 'India', isoCode: 'IND', tierClassification: 'Group A:6' },
  { key: 'country-irn', name: 'Iran', isoCode: 'IRN', tierClassification: 'Group D:5' },
  { key: 'country-tur', name: 'Turkey', isoCode: 'TUR', tierClassification: 'Group A:6' },
  {
    key: 'country-are',
    name: 'United Arab Emirates',
    isoCode: 'ARE',
    tierClassification: 'Group A:6',
  },
] as const;

const restrictionTypes = [
  {
    key: 'rest-01',
    name: 'License Required (Presumption of Denial)',
    description:
      'Exports require a license and are generally reviewed under a presumption of denial.',
  },
  {
    key: 'rest-02',
    name: 'Entity List Addition',
    description: 'Named parties are added to the BIS Entity List.',
  },
  {
    key: 'rest-03',
    name: 'Foreign Direct Product Rule (FDPR)',
    description:
      'Foreign-produced items become subject to the EAR when specified U.S. technology inputs are used.',
  },
  {
    key: 'rest-04',
    name: 'U.S. Persons Activity Prohibition',
    description: 'Certain activities by U.S. persons require authorization.',
  },
  {
    key: 'rest-05',
    name: 'Unverified List (UVL)',
    description:
      'Parties are subject to enhanced due diligence because end-use checks could not be completed.',
  },
  {
    key: 'rest-06',
    name: 'License Exception Authorization (Notified Advanced Computing)',
    description: 'Eligible transactions can proceed under a notified license exception path.',
  },
  {
    key: 'rest-07',
    name: 'Case-by-Case Review (Advanced Computing)',
    description:
      'License applications are reviewed case by case for a defined advanced-computing chip class.',
  },
  {
    key: 'rest-08',
    name: 'Worldwide License Requirement (Tiered)',
    description:
      'A global tiered licensing framework applies by destination and transaction profile.',
  },
] as const;

const companies = [
  {
    key: 'comp-nvda',
    name: 'NVIDIA Corporation',
    hqCountryKey: 'country-usa',
    entityListStatus: 'Clear',
    aliases: ['NVIDIA', 'NVDA'],
  },
  {
    key: 'comp-amd',
    name: 'Advanced Micro Devices, Inc.',
    hqCountryKey: 'country-usa',
    entityListStatus: 'Clear',
    aliases: ['AMD'],
  },
  {
    key: 'comp-intel',
    name: 'Intel Corporation',
    hqCountryKey: 'country-usa',
    entityListStatus: 'Clear',
    aliases: ['Intel'],
  },
  {
    key: 'comp-lrcx',
    name: 'Lam Research Corporation',
    hqCountryKey: 'country-usa',
    entityListStatus: 'Clear',
    aliases: ['Lam Research'],
  },
  {
    key: 'comp-amat',
    name: 'Applied Materials, Inc.',
    hqCountryKey: 'country-usa',
    entityListStatus: 'Clear',
    aliases: ['Applied Materials', 'AMAT'],
  },
  {
    key: 'comp-huawei',
    name: 'Huawei Technologies Co., Ltd.',
    hqCountryKey: 'country-chn',
    entityListStatus: 'Entity List (Footnote 4/5)',
    aliases: ['Huawei', 'HiSilicon'],
  },
  {
    key: 'comp-smic',
    name: 'Semiconductor Manufacturing International Corp.',
    hqCountryKey: 'country-chn',
    entityListStatus: 'Entity List',
    aliases: ['SMIC'],
  },
  {
    key: 'comp-inspur',
    name: 'Inspur Group',
    hqCountryKey: 'country-chn',
    entityListStatus: 'Entity List',
    aliases: ['Inspur'],
  },
  {
    key: 'comp-ymtc',
    name: 'Yangtze Memory Technologies Corp.',
    hqCountryKey: 'country-chn',
    entityListStatus: 'Entity List',
    aliases: ['YMTC'],
  },
  {
    key: 'comp-biren',
    name: 'Biren Technology',
    hqCountryKey: 'country-chn',
    entityListStatus: 'Entity List',
    aliases: ['Biren'],
  },
  {
    key: 'comp-mthreads',
    name: 'Moore Threads Technology',
    hqCountryKey: 'country-chn',
    entityListStatus: 'Entity List',
    aliases: ['Moore Threads'],
  },
  {
    key: 'comp-asml',
    name: 'ASML Holding N.V.',
    hqCountryKey: 'country-nld',
    entityListStatus: 'Clear',
    aliases: ['ASML'],
  },
  {
    key: 'comp-asmi',
    name: 'ASM International N.V.',
    hqCountryKey: 'country-nld',
    entityListStatus: 'Clear',
    aliases: ['ASMI'],
  },
  {
    key: 'comp-tel',
    name: 'Tokyo Electron Limited',
    hqCountryKey: 'country-jpn',
    entityListStatus: 'Clear',
    aliases: ['TEL', 'Tokyo Electron'],
  },
  {
    key: 'comp-nikon',
    name: 'Nikon Corporation',
    hqCountryKey: 'country-jpn',
    entityListStatus: 'Clear',
    aliases: ['Nikon'],
  },
  {
    key: 'comp-advantest',
    name: 'Advantest Corporation',
    hqCountryKey: 'country-jpn',
    entityListStatus: 'Clear',
    aliases: ['Advantest'],
  },
  {
    key: 'comp-samsung',
    name: 'Samsung Electronics Co., Ltd.',
    hqCountryKey: 'country-kor',
    entityListStatus: 'Clear (VEU)',
    aliases: ['Samsung'],
  },
  {
    key: 'comp-skhynix',
    name: 'SK Hynix Inc.',
    hqCountryKey: 'country-kor',
    entityListStatus: 'Clear (VEU)',
    aliases: ['SK Hynix'],
  },
  {
    key: 'comp-tsmc',
    name: 'Taiwan Semiconductor Manufacturing Co.',
    hqCountryKey: 'country-twn',
    entityListStatus: 'Clear',
    aliases: ['TSMC'],
  },
] as const;

const jurisdictions = [
  ['pol-2022-oct', 'country-chn', 'rest-01'],
  ['pol-2022-oct', 'country-chn', 'rest-04'],
  ['pol-2023-oct', 'country-mac', 'rest-01'],
  ['pol-2023-oct', 'country-chn', 'rest-03'],
  ['pol-2024-dec-fdpr', 'country-chn', 'rest-03'],
  ['pol-2024-dec-entitylist', 'country-chn', 'rest-02'],
  ['pol-2025-jan-diffusion', 'country-chn', 'rest-08'],
  ['pol-2025-jan-diffusion', 'country-mac', 'rest-08'],
  ['pol-2025-jan-duediligence', 'country-chn', 'rest-05'],
  ['pol-2025-jan-entitylist', 'country-chn', 'rest-02'],
  ['pol-2025-jan-entitylist', 'country-sgp', 'rest-02'],
  ['pol-2025-sep-entitylist', 'country-chn', 'rest-02'],
  ['pol-2025-sep-entitylist', 'country-ind', 'rest-02'],
  ['pol-2025-sep-entitylist', 'country-irn', 'rest-02'],
  ['pol-2025-sep-entitylist', 'country-tur', 'rest-02'],
  ['pol-2025-sep-entitylist', 'country-are', 'rest-02'],
  ['pol-2026-jan-licenserevision', 'country-chn', 'rest-07'],
  ['pol-2026-jan-licenserevision', 'country-mac', 'rest-07'],
] as const;

const policyRevisions = [
  {
    key: 'rev-101',
    policyKey: 'pol-2022-oct',
    revisionDate: date('2022-10-07'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary: 'Initial interim final rule text issued for public display.',
  },
  {
    key: 'rev-102',
    policyKey: 'pol-2022-oct',
    revisionDate: date('2023-01-18'),
    previousStatus: PolicyStatus.ACTIVE,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary: 'Macau amendment adds Macau (Country Group D:5) to destination controls.',
  },
  {
    key: 'rev-103',
    policyKey: 'pol-2022-oct',
    revisionDate: date('2023-10-17'),
    previousStatus: PolicyStatus.ACTIVE,
    newStatus: PolicyStatus.SUPERSEDED,
    changeSummary:
      'Superseded by the 2023 advanced computing and semiconductor manufacturing updates.',
  },
  {
    key: 'rev-201',
    policyKey: 'pol-2023-oct',
    revisionDate: date('2023-10-25'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary:
      'Publication replaces the interconnect-bandwidth ceiling with Total Processing Performance.',
  },
  {
    key: 'rev-202',
    policyKey: 'pol-2023-oct',
    revisionDate: date('2023-11-17'),
    previousStatus: PolicyStatus.ACTIVE,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary: 'Rule reaches its full enforcement effective date.',
  },
  {
    key: 'rev-301',
    policyKey: 'pol-2024-dec-fdpr',
    revisionDate: date('2024-12-05'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary:
      'Published concurrently with the companion Entity List rule and adds FDPR and HBM controls.',
  },
  {
    key: 'rev-401',
    policyKey: 'pol-2024-dec-entitylist',
    revisionDate: date('2024-12-05'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary:
      'Adds roughly 140 entities to the Entity List and modifies existing China entries.',
  },
  {
    key: 'rev-501',
    policyKey: 'pol-2025-jan-diffusion',
    revisionDate: date('2025-01-13'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary:
      'Interim final rule introduces a worldwide tiered license requirement and AI model-weight controls.',
  },
  {
    key: 'rev-502',
    policyKey: 'pol-2025-jan-diffusion',
    revisionDate: date('2025-05-13'),
    previousStatus: PolicyStatus.ACTIVE,
    newStatus: PolicyStatus.CONTESTED,
    changeSummary:
      'Commerce announces planned rescission and directs BIS enforcement officials not to enforce the rule pending formal rescission.',
  },
  {
    key: 'rev-503',
    policyKey: 'pol-2025-jan-diffusion',
    revisionDate: date('2026-05-12'),
    previousStatus: PolicyStatus.CONTESTED,
    newStatus: PolicyStatus.CONTESTED,
    changeSummary:
      "GAO concludes Commerce's May 2025 non-enforcement announcement was a rule subject to the Congressional Review Act.",
  },
  {
    key: 'rev-601',
    policyKey: 'pol-2025-jan-duediligence',
    revisionDate: date('2025-01-16'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary:
      'Initial due diligence measures take effect for advanced computing integrated circuits.',
  },
  {
    key: 'rev-701',
    policyKey: 'pol-2025-jan-entitylist',
    revisionDate: date('2025-01-16'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary: 'Initial Entity List additions take effect.',
  },
  {
    key: 'rev-801',
    policyKey: 'pol-2025-sep-entitylist',
    revisionDate: date('2025-09-12'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary: 'Entity List additions and revisions take effect.',
  },
  {
    key: 'rev-901',
    policyKey: 'pol-2026-jan-licenserevision',
    revisionDate: date('2026-01-15'),
    previousStatus: PolicyStatus.DRAFT,
    newStatus: PolicyStatus.ACTIVE,
    changeSummary:
      'License review policy revision takes effect for specified China and Macau transactions.',
  },
] as const;

const timelineEvents = [
  {
    key: 'evt-01',
    policyKey: 'pol-2022-oct',
    eventDate: date('2022-10-07'),
    eventType: 'Initial Publication',
    description:
      'BIS releases the foundational advanced computing and semiconductor manufacturing rule.',
    sourceName: 'BIS Federal Register',
    sourceUrl: policySourceUrl['pol-2022-oct'],
  },
  {
    key: 'evt-02',
    policyKey: 'pol-2022-oct',
    eventDate: date('2022-10-28'),
    eventType: 'Temporary General License',
    description: 'BIS issues a temporary general license for specific manufacturing activities.',
    sourceName: 'BIS Federal Register',
    sourceUrl: policySourceUrl['pol-2022-oct'],
  },
  {
    key: 'evt-03',
    policyKey: 'pol-2023-oct',
    eventDate: date('2023-10-17'),
    eventType: 'Expansion',
    description:
      'BIS closes chip-spec loopholes and brings A800/H800-class accelerators under the TPP formula.',
    sourceName: 'BIS Federal Register',
    sourceUrl: policySourceUrl['pol-2023-oct'],
  },
  {
    key: 'evt-04',
    policyKey: 'pol-2024-dec-entitylist',
    eventDate: date('2024-12-05'),
    eventType: 'Expansion and List Addition',
    description:
      'BIS adds roughly 140 entities to the Entity List and newly restricts high-bandwidth memory.',
    sourceName: 'BIS Federal Register',
    sourceUrl: policySourceUrl['pol-2024-dec-entitylist'],
  },
  {
    key: 'evt-05',
    policyKey: 'pol-2025-jan-diffusion',
    eventDate: date('2025-01-15'),
    eventType: 'Initial Publication',
    description:
      'The AI Diffusion Framework is published, adding tiered AI chip controls and model-weight controls.',
    sourceName: 'BIS Federal Register',
    sourceUrl: policySourceUrl['pol-2025-jan-diffusion'],
  },
  {
    key: 'evt-06',
    policyKey: 'pol-2025-jan-diffusion',
    eventDate: date('2025-05-13'),
    eventType: 'Non-Enforcement Announced',
    description:
      'Commerce announces intent to rescind the AI Diffusion rule and instructs BIS not to enforce it ahead of the May 15 compliance date.',
    sourceName: 'BIS Press Release',
    sourceUrl:
      'https://media.bis.gov/press-release/department-commerce-announces-rescission-biden-era-artificial-intelligence-diffusion-rule-strengthens',
  },
  {
    key: 'evt-07',
    policyKey: 'pol-2025-jan-diffusion',
    eventDate: date('2026-05-12'),
    eventType: 'Legal Challenge',
    description:
      'GAO rules that Commerce should have submitted the non-enforcement announcement to Congress under the Congressional Review Act.',
    sourceName: 'U.S. Government Accountability Office',
    sourceUrl: 'https://www.gao.gov/products/b-337935',
  },
  {
    key: 'evt-08',
    policyKey: 'pol-2025-sep-entitylist',
    eventDate: date('2025-09-12'),
    eventType: 'Expansion and List Addition',
    description:
      'Entity List coverage expands to entities in China, India, Iran, Singapore, Turkey, and the United Arab Emirates.',
    sourceName: 'BIS Federal Register',
    sourceUrl: policySourceUrl['pol-2025-sep-entitylist'],
  },
  {
    key: 'evt-09',
    policyKey: 'pol-2026-jan-licenserevision',
    eventDate: date('2026-01-15'),
    eventType: 'License Policy Revision',
    description:
      'China and Macau review policy for a defined advanced-computing chip class moves to case-by-case review.',
    sourceName: 'BIS Federal Register',
    sourceUrl: policySourceUrl['pol-2026-jan-licenserevision'],
  },
] as const;

const policyTechnologies = {
  'pol-2022-oct': ['tech-01', 'tech-03', 'tech-04', 'tech-06', 'tech-07', 'tech-08'],
  'pol-2023-oct': ['tech-02', 'tech-06', 'tech-07'],
  'pol-2024-dec-fdpr': ['tech-01', 'tech-02', 'tech-03', 'tech-04', 'tech-08'],
  'pol-2024-dec-entitylist': ['tech-01', 'tech-02', 'tech-03', 'tech-04', 'tech-08'],
  'pol-2025-jan-diffusion': ['tech-06', 'tech-07', 'tech-09'],
  'pol-2025-jan-duediligence': ['tech-02', 'tech-06'],
  'pol-2025-jan-entitylist': ['tech-01', 'tech-06'],
  'pol-2025-sep-entitylist': ['tech-01', 'tech-06', 'tech-08'],
  'pol-2026-jan-licenserevision': ['tech-06'],
} as const;

const policyCompanies = {
  'pol-2022-oct': [
    'comp-nvda',
    'comp-amd',
    'comp-intel',
    'comp-huawei',
    'comp-smic',
    'comp-ymtc',
    'comp-lrcx',
    'comp-amat',
  ],
  'pol-2023-oct': [
    'comp-nvda',
    'comp-amd',
    'comp-intel',
    'comp-huawei',
    'comp-smic',
    'comp-biren',
    'comp-mthreads',
  ],
  'pol-2024-dec-fdpr': [
    'comp-amat',
    'comp-lrcx',
    'comp-asml',
    'comp-asmi',
    'comp-tel',
    'comp-nikon',
    'comp-samsung',
    'comp-skhynix',
    'comp-tsmc',
    'comp-smic',
    'comp-huawei',
  ],
  'pol-2024-dec-entitylist': [
    'comp-huawei',
    'comp-smic',
    'comp-ymtc',
    'comp-biren',
    'comp-mthreads',
  ],
  'pol-2025-jan-diffusion': [
    'comp-nvda',
    'comp-amd',
    'comp-intel',
    'comp-tsmc',
    'comp-samsung',
    'comp-skhynix',
  ],
  'pol-2025-jan-duediligence': [
    'comp-tsmc',
    'comp-samsung',
    'comp-skhynix',
    'comp-smic',
    'comp-ymtc',
  ],
  'pol-2025-jan-entitylist': [
    'comp-huawei',
    'comp-smic',
    'comp-ymtc',
    'comp-biren',
    'comp-mthreads',
  ],
  'pol-2025-sep-entitylist': ['comp-huawei', 'comp-smic', 'comp-biren', 'comp-mthreads'],
  'pol-2026-jan-licenserevision': ['comp-nvda', 'comp-amd', 'comp-intel'],
} as const;

async function main() {
  console.log('Seeding curated diffusion-node policy data...');

  const demoPasswordHash = await bcrypt.hash('password123', 12);
  const seededUsers = new Map<string, { id: string }>();

  for (const user of users) {
    const result = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        passwordHash: demoPasswordHash,
        role: user.role,
      },
      create: {
        id: seedId(user.key),
        email: user.email,
        passwordHash: demoPasswordHash,
        role: user.role,
      },
      select: { id: true },
    });

    seededUsers.set(user.key, result);
  }

  const developer = seededUsers.get('user-developer');
  if (!developer) {
    throw new Error('Seed developer user was not created.');
  }

  const demoApiKey = 'dn_dev_demo_key_please_rotate';
  await prisma.apiKey.upsert({
    where: { key: hashApiKey(demoApiKey) },
    update: {
      label: 'Seeded development API key',
      revokedAt: null,
      userId: developer.id,
    },
    create: {
      id: seedId('api-key-developer-demo'),
      key: hashApiKey(demoApiKey),
      label: 'Seeded development API key',
      userId: developer.id,
    },
  });

  for (const category of technologyCategories) {
    await prisma.technologyCategory.upsert({
      where: { id: seedId(category.key) },
      update: {
        isActiveInV1: category.isActiveInV1,
        name: category.name,
      },
      create: {
        id: seedId(category.key),
        isActiveInV1: category.isActiveInV1,
        name: category.name,
      },
    });
  }

  for (const country of countries) {
    await prisma.country.upsert({
      where: { id: seedId(country.key) },
      update: {
        isoCode: country.isoCode,
        name: country.name,
        tierClassification: country.tierClassification,
      },
      create: {
        id: seedId(country.key),
        isoCode: country.isoCode,
        name: country.name,
        tierClassification: country.tierClassification,
      },
    });
  }

  for (const restrictionType of restrictionTypes) {
    await prisma.restrictionType.upsert({
      where: { id: seedId(restrictionType.key) },
      update: {
        description: restrictionType.description,
        name: restrictionType.name,
      },
      create: {
        id: seedId(restrictionType.key),
        description: restrictionType.description,
        name: restrictionType.name,
      },
    });
  }

  for (const technology of technologies) {
    await prisma.technology.upsert({
      where: { id: seedId(technology.key) },
      update: {
        categoryId: seedId(technology.categoryKey),
        description: technology.description,
        name: technology.name,
      },
      create: {
        id: seedId(technology.key),
        categoryId: seedId(technology.categoryKey),
        description: technology.description,
        name: technology.name,
      },
    });
  }

  for (const company of companies) {
    await prisma.company.upsert({
      where: { id: seedId(company.key) },
      update: {
        aliases: [...company.aliases],
        entityListStatus: company.entityListStatus,
        hqCountryId: seedId(company.hqCountryKey),
        name: company.name,
      },
      create: {
        id: seedId(company.key),
        aliases: [...company.aliases],
        entityListStatus: company.entityListStatus,
        hqCountryId: seedId(company.hqCountryKey),
        name: company.name,
      },
    });
  }

  for (const policy of policies) {
    await prisma.policy.upsert({
      where: { id: seedId(policy.key) },
      update: {
        controlNumber: policy.controlNumber,
        effectiveDate: policy.effectiveDate,
        status: policy.status,
        summary: policy.summary,
        title: policy.title,
      },
      create: {
        id: seedId(policy.key),
        controlNumber: policy.controlNumber,
        effectiveDate: policy.effectiveDate,
        status: policy.status,
        summary: policy.summary,
        title: policy.title,
      },
    });

    await prisma.policySource.upsert({
      where: { id: seedId(`source-${policy.key}`) },
      update: {
        policyId: seedId(policy.key),
        publishedDate: policy.publishedDate,
        sourceName: 'BIS Federal Register',
        sourceUrl: policySourceUrl[policy.key],
      },
      create: {
        id: seedId(`source-${policy.key}`),
        policyId: seedId(policy.key),
        publishedDate: policy.publishedDate,
        sourceName: 'BIS Federal Register',
        sourceUrl: policySourceUrl[policy.key],
      },
    });

    await prisma.document.upsert({
      where: { id: seedId(`document-${policy.key}`) },
      update: {
        documentType: 'Federal Register PDF',
        policyId: seedId(policy.key),
        publishedDate: policy.publishedDate,
        title: policy.title,
        url: policy.documentUrl,
      },
      create: {
        id: seedId(`document-${policy.key}`),
        documentType: 'Federal Register PDF',
        policyId: seedId(policy.key),
        publishedDate: policy.publishedDate,
        title: policy.title,
        url: policy.documentUrl,
      },
    });
  }

  for (const [policyKey, countryKey, restrictionTypeKey] of jurisdictions) {
    await prisma.jurisdiction.upsert({
      where: { id: seedId(`jurisdiction-${policyKey}-${countryKey}-${restrictionTypeKey}`) },
      update: {
        countryId: seedId(countryKey),
        policyId: seedId(policyKey),
        restrictionTypeId: seedId(restrictionTypeKey),
      },
      create: {
        id: seedId(`jurisdiction-${policyKey}-${countryKey}-${restrictionTypeKey}`),
        countryId: seedId(countryKey),
        policyId: seedId(policyKey),
        restrictionTypeId: seedId(restrictionTypeKey),
      },
    });
  }

  for (const revision of policyRevisions) {
    await prisma.policyRevision.upsert({
      where: { id: seedId(revision.key) },
      update: {
        changeSummary: revision.changeSummary,
        newStatus: revision.newStatus,
        policyId: seedId(revision.policyKey),
        previousStatus: revision.previousStatus,
        revisionDate: revision.revisionDate,
      },
      create: {
        id: seedId(revision.key),
        changeSummary: revision.changeSummary,
        newStatus: revision.newStatus,
        policyId: seedId(revision.policyKey),
        previousStatus: revision.previousStatus,
        revisionDate: revision.revisionDate,
      },
    });
  }

  for (const event of timelineEvents) {
    await prisma.timelineEvent.upsert({
      where: { id: seedId(event.key) },
      update: {
        description: event.description,
        eventDate: event.eventDate,
        eventType: event.eventType,
        policyId: seedId(event.policyKey),
        sourceName: event.sourceName,
        sourceUrl: event.sourceUrl,
      },
      create: {
        id: seedId(event.key),
        description: event.description,
        eventDate: event.eventDate,
        eventType: event.eventType,
        policyId: seedId(event.policyKey),
        sourceName: event.sourceName,
        sourceUrl: event.sourceUrl,
      },
    });
  }

  for (const [policyKey, technologyKeys] of Object.entries(policyTechnologies)) {
    for (const technologyKey of technologyKeys) {
      await prisma.policyTechnology.upsert({
        where: { id: seedId(`policy-technology-${policyKey}-${technologyKey}`) },
        update: {
          policyId: seedId(policyKey),
          technologyId: seedId(technologyKey),
        },
        create: {
          id: seedId(`policy-technology-${policyKey}-${technologyKey}`),
          policyId: seedId(policyKey),
          technologyId: seedId(technologyKey),
        },
      });
    }
  }

  for (const [policyKey, companyKeys] of Object.entries(policyCompanies)) {
    for (const companyKey of companyKeys) {
      await prisma.policyCompany.upsert({
        where: { id: seedId(`policy-company-${policyKey}-${companyKey}`) },
        update: {
          companyId: seedId(companyKey),
          policyId: seedId(policyKey),
        },
        create: {
          id: seedId(`policy-company-${policyKey}-${companyKey}`),
          companyId: seedId(companyKey),
          policyId: seedId(policyKey),
        },
      });
    }
  }

  console.log(
    [
      `Seeded ${users.length} users`,
      `${countries.length} countries`,
      `${companies.length} companies`,
      `${technologies.length} technologies`,
      `${policies.length} policies`,
      `${Object.values(policyCompanies).flat().length} policy-company links`,
      `${Object.values(policyTechnologies).flat().length} policy-technology links`,
    ].join(', '),
  );
  console.log(`Development API key: ${demoApiKey}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
