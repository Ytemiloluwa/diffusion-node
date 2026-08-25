import prisma from '../db/prisma';
import { runFederalRegisterIngestion } from '../services/ingestionService';

type ParsedArgs = {
  dryRun: boolean;
  limit?: number;
  publicationDateGte?: string;
  sourceId?: string;
  terms: string[];
};

const readNextArg = (args: string[], index: number, flag: string): string => {
  const value = args[index + 1];

  if (!value || value.startsWith('--')) {
    throw new Error(`${flag} requires a value.`);
  }

  return value;
};

const parseArgs = (args: string[]): ParsedArgs => {
  const parsedArgs: ParsedArgs = {
    dryRun: false,
    terms: [],
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case '--dry-run':
        parsedArgs.dryRun = true;
        break;
      case '--limit':
        parsedArgs.limit = Number(readNextArg(args, index, arg));
        index += 1;
        break;
      case '--since':
        parsedArgs.publicationDateGte = readNextArg(args, index, arg);
        index += 1;
        break;
      case '--source-id':
        parsedArgs.sourceId = readNextArg(args, index, arg);
        index += 1;
        break;
      case '--term':
        parsedArgs.terms.push(readNextArg(args, index, arg));
        index += 1;
        break;
      default:
        throw new Error(`Unknown option: ${arg}`);
    }
  }

  return parsedArgs;
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const result = await runFederalRegisterIngestion({
    dryRun: args.dryRun,
    limit: args.limit,
    publicationDateGte: args.publicationDateGte,
    sourceId: args.sourceId,
    terms: args.terms.length ? args.terms : undefined,
  });

  console.log(
    JSON.stringify(
      {
        documentsCreated: result.documentsCreated,
        documentsFound: result.documentsFound,
        documentsUpdated: result.documentsUpdated,
        dryRun: result.dryRun,
        runId: result.runId,
        sourceId: result.sourceId,
      },
      null,
      2,
    ),
  );
};

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
