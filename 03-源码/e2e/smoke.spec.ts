import { test, expect } from '@playwright/test';

/**
 * 公司管理平台核心页面端到端测试
 * 验证页面加载、导航、数据展示等核心功能
 */

test.describe('公司管理平台', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('首页加载成功', async ({ page }) => {
    await expect(page).toHaveTitle(/启明科技/);
    await expect(page.locator('text=总览')).toBeVisible();
  });

  test('导航到部门页面', async ({ page }) => {
    await page.click('text=部门');
    await expect(page.locator('text=技术部')).toBeVisible();
    await expect(page.locator('text=设计部')).toBeVisible();
  });

  test('导航到项目页面', async ({ page }) => {
    await page.click('text=项目');
    await expect(page.locator('text=公司管理平台')).toBeVisible();
  });

  test('导航到任务页面', async ({ page }) => {
    await page.click('text=任务');
    await expect(page.locator('text=看板')).toBeVisible();
    await expect(page.locator('text=列表')).toBeVisible();
  });

  test('导航到文档页面', async ({ page }) => {
    await page.click('text=文档');
    await expect(page.locator('text=API 接口文档')).toBeVisible();
  });

  test('页面切换不报错', async ({ page }) => {
    // 验证所有页面切换不会触发 JavaScript 错误
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.click('text=部门');
    await page.waitForTimeout(500);
    await page.click('text=项目');
    await page.waitForTimeout(500);
    await page.click('text=任务');
    await page.waitForTimeout(500);
    await page.click('text=文档');
    await page.waitForTimeout(500);
    await page.click('text=总览');
    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
  });

  test('API 响应格式正确', async ({ page }) => {
    const response = await page.request.get('/api/projects');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);

    if (body.data.length > 0) {
      const project = body.data[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('workflow');
      expect(Array.isArray(project.workflow)).toBe(true);

      if (project.workflow.length > 0) {
        expect(project.workflow[0]).toHaveProperty('agentName');
        expect(project.workflow[0]).toHaveProperty('agentAvatar');
      }
    }
  });
});
