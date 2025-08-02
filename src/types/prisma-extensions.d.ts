// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Prisma } from '@prisma/client';
import { PrismaClient as OriginalPrismaClient } from '@prisma/client';
import { Tag, ServiceTag } from '@/types';

declare global {
  namespace PrismaJson {
    type TagData = {
      id: number;
      name: string;
    };
  }
}

declare module '@prisma/client' {
  // 扩展 PrismaClient 类型
  export interface PrismaClient extends OriginalPrismaClient {
    tag: {
      findUnique: (args: Prisma.TagFindUniqueArgs) => Promise<Tag | null>;
      findFirst: (args: Prisma.TagFindFirstArgs) => Promise<Tag | null>;
      findMany: (args: Prisma.TagFindManyArgs) => Promise<Tag[]>;
      create: (args: Prisma.TagCreateArgs) => Promise<Tag>;
      update: (args: Prisma.TagUpdateArgs) => Promise<Tag>;
      delete: (args: Prisma.TagDeleteArgs) => Promise<Tag>;
    };
    serviceTag: {
      findUnique: (
        args: Prisma.ServiceTagFindUniqueArgs
      ) => Promise<ServiceTag | null>;
      findFirst: (
        args: Prisma.ServiceTagFindFirstArgs
      ) => Promise<ServiceTag | null>;
      findMany: (args: Prisma.ServiceTagFindManyArgs) => Promise<ServiceTag[]>;
      create: (args: Prisma.ServiceTagCreateArgs) => Promise<ServiceTag>;
      createMany: (
        args: Prisma.ServiceTagCreateManyArgs
      ) => Promise<Prisma.BatchPayload>;
      update: (args: Prisma.ServiceTagUpdateArgs) => Promise<ServiceTag>;
      delete: (args: Prisma.ServiceTagDeleteArgs) => Promise<ServiceTag>;
      deleteMany: (
        args: Prisma.ServiceTagDeleteManyArgs
      ) => Promise<Prisma.BatchPayload>;
    };
  }

  // 扩展 Prisma 命名空间
  namespace Prisma {
    // 扩展 CategoryOrderByWithRelationInput 类型
    interface CategoryOrderByWithRelationInput {
      sortOrder?: Prisma.SortOrder;
    }

    // 定义 TagFindUniqueArgs 类型
    interface TagFindUniqueArgs {
      where: {
        id?: number;
        name?: string;
      };
    }

    // 定义 TagFindFirstArgs 类型
    interface TagFindFirstArgs {
      where?: {
        id?: number | { not?: number };
        name?: string;
      };
    }

    // 定义 TagFindManyArgs 类型
    interface TagFindManyArgs {
      where?: {
        id?: number;
        name?: string;
      };
    }

    // 定义 TagCreateArgs 类型
    interface TagCreateArgs {
      data: {
        name: string;
        updatedAt?: Date;
      };
    }

    // 定义 TagUpdateArgs 类型
    interface TagUpdateArgs {
      where: {
        id: number;
      };
      data: {
        name?: string;
        updatedAt?: Date;
      };
    }

    // 定义 TagDeleteArgs 类型
    interface TagDeleteArgs {
      where: {
        id: number;
      };
    }

    // 定义 ServiceTagFindUniqueArgs 类型
    interface ServiceTagFindUniqueArgs {
      where: {
        serviceId_tagId?: {
          serviceId: number;
          tagId: number;
        };
      };
    }

    // 定义 ServiceTagFindFirstArgs 类型
    interface ServiceTagFindFirstArgs {
      where?: {
        serviceId?: number;
        tagId?: number;
      };
    }

    // 定义 ServiceTagFindManyArgs 类型
    interface ServiceTagFindManyArgs {
      where?: {
        serviceId?: number;
        tagId?: number;
      };
      include?: {
        tag?: boolean;
        service?: boolean;
      };
    }

    // 定义 ServiceTagCreateArgs 类型
    interface ServiceTagCreateArgs {
      data: {
        serviceId: number;
        tagId: number;
      };
    }

    // 定义 ServiceTagCreateManyArgs 类型
    interface ServiceTagCreateManyArgs {
      data: {
        serviceId: number;
        tagId: number;
      }[];
    }

    // 定义 ServiceTagUpdateArgs 类型
    interface ServiceTagUpdateArgs {
      where: {
        serviceId_tagId: {
          serviceId: number;
          tagId: number;
        };
      };
      data: {
        serviceId?: number;
        tagId?: number;
      };
    }

    // 定义 ServiceTagDeleteArgs 类型
    interface ServiceTagDeleteArgs {
      where: {
        serviceId_tagId: {
          serviceId: number;
          tagId: number;
        };
      };
    }

    // 定义 ServiceTagDeleteManyArgs 类型
    interface ServiceTagDeleteManyArgs {
      where: {
        serviceId?: number;
        tagId?: number;
      };
    }

    // 定义 BatchPayload 类型
    interface BatchPayload {
      count: number;
    }

    // 扩展 ServiceInclude 类型
    interface ServiceInclude {
      tags?:
        | boolean
        | {
            include?: {
              tag?: boolean;
            };
          };
    }
  }
}

export {};
