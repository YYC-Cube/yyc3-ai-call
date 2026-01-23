/**
 * @fileoverview 客户管理API路由
 * @description 处理客户的CRUD操作
 * @module app/api/customers/route
 * @author YYC³
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from "next/server";

// 接口定义
interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  status:
    | "new"
    | "contacted"
    | "interested"
    | "negotiating"
    | "closed"
    | "lost";
  tags?: string[];
  followUpDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

// TODO: 待实现 - 连接到真实数据库
// import { getDatabase } from '@/lib/db';

/**
 * GET /api/customers
 * 获取客户列表
 * @query page - 页码，默认1
 * @query limit - 每页数量，默认10
 * @query search - 搜索关键词
 * @query status - 按状态过滤
 */
export async function GET(request: NextRequest) {
  try {
    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Number(searchParams.get("limit")) || 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");

    // TODO: 实现数据库查询
    // const db = await getDatabase();
    // const customers = await db.query(
    //   'SELECT * FROM customers WHERE ...',
    //   [...]
    // );

    // 临时Mock数据（实现前）
    const mockCustomers: Customer[] = [
      {
        id: 1,
        name: "张三",
        email: "zhangsan@example.com",
        phone: "13800138000",
        status: "new",
        tags: ["VIP", "已咨询"],
        createdAt: new Date().toISOString(),
      },
      // ... 更多mock数据
    ];

    const filtered = mockCustomers.filter((customer) => {
      const matchSearch = search
        ? [customer.name, customer.email, customer.phone]
            .filter(Boolean)
            .some((field) =>
              field?.toLowerCase().includes(search.toLowerCase()),
            )
        : true;
      const matchStatus = status ? customer.status === status : true;
      return matchSearch && matchStatus;
    });

    const total = filtered.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const customers = filtered.slice(start, start + limit);

    return NextResponse.json<
      ApiResponse<{ customers: Customer[]; total: number; pages: number }>
    >({
      success: true,
      data: {
        customers,
        total,
        pages,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch customers:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "FETCH_ERROR",
          message: "获取客户列表失败",
          details: { error: String(error) },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/customers
 * 创建新客户
 * @body customer - 客户信息
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = (await request.json()) as Partial<Customer>;

    // 验证必填字段
    const errors: Record<string, string> = {};
    if (!body.name?.trim()) errors.name = "客户名称不能为空";
    if (!body.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      errors.email = "邮箱格式不正确";
    if (!body.phone?.trim()) errors.phone = "电话不能为空";
    if (!body.status) errors.status = "客户状态不能为空";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "参数验证失败",
            details: errors,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }

    // TODO: 保存到数据库
    // const db = await getDatabase();
    // const result = await db.query(
    //   'INSERT INTO customers (...) VALUES (...) RETURNING id',
    //   [body.name, body.email, body.phone, body.status]
    // );

    // 临时Mock响应
    const newCustomer: Customer = {
      id: Date.now(), // 临时ID
      ...(body as Customer),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json<ApiResponse<Customer>>(
      {
        success: true,
        data: newCustomer,
        timestamp: new Date().toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create customer:", error);
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: {
          code: "CREATE_ERROR",
          message: "创建客户失败",
          details: { error: String(error) },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
