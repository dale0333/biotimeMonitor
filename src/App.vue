<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Transaction Monitor</h1>
              <p class="text-sm text-gray-600">Real-time attendance tracking system</p>
            </div>
          </div>
          <div v-if="isAuthenticated" class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="flex items-center space-x-1">
                <div :class="['w-2 h-2 rounded-full', autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400']"></div>
                <span class="text-xs text-gray-500">{{ autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF' }}</span>
              </div>
              <button 
                @click="toggleAutoRefresh"
                class="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded transition duration-200"
              >
                {{ autoRefresh ? 'Stop' : 'Start' }}
              </button>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-700">Welcome, {{ userInfo.first_name }} {{ userInfo.last_name }}</p>
              <p class="text-xs text-gray-500">{{ userInfo.role || 'Administrator' }}</p>
              <p v-if="userAreas.length > 0" class="text-xs text-blue-600">
                Authorized Areas: {{ userAreas.map(area => area.area_name).join(', ') }}
              </p>
            </div>
            <button 
              @click="logout"
              class="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto px-4 py-8">
      <!-- Login Card -->
      <div v-if="!isAuthenticated" class="max-w-md mx-auto">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8 text-center">
            <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p class="text-blue-100">Sign in to access the transaction monitor</p>
          </div>
          
          <div class="px-6 py-8">
            <form @submit.prevent="login" class="space-y-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <input 
                  v-model="credentials.username"
                  type="text" 
                  class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter your username"
                  required
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  v-model="credentials.password"
                  type="password" 
                  class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="Enter your password"
                  required
                >
              </div>

              <div v-if="proxyStatus" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-blue-700 text-sm">{{ proxyStatus }}</p>
              </div>

              <button 
                type="submit" 
                class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 font-medium flex items-center justify-center"
                :disabled="loading"
              >
                <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Signing in...' : 'Sign In' }}
              </button>
            </form>

            <div v-if="error" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-700 text-sm">{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard -->
      <div v-else class="space-y-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Total Records</p>
                <p class="text-2xl font-bold text-gray-900">{{ pagination.count }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Check-ins</p>
                <p class="text-2xl font-bold text-gray-900">{{ getCheckinCount }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Check-outs</p>
                <p class="text-2xl font-bold text-gray-900">{{ getCheckoutCount }}</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div class="flex items-center">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-600">Last Updated</p>
                <p class="text-lg font-bold text-gray-900">{{ lastUpdated }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Area Filter -->
        <div v-if="userAreas.length > 1" class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">Area Filter</h3>
              <p class="text-sm text-gray-600">Select area to view transactions</p>
            </div>
            <div class="flex space-x-2">
              <select 
                v-model="selectedArea"
                @change="onAreaChange"
                class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Authorized Areas</option>
                <option v-for="area in userAreas" :key="area.id" :value="area.id">
                  {{ area.area_name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <div class="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select 
                  v-model="filters.emp_code"
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Employees</option>
                  <option v-for="employee in authorizedEmployees" :key="employee.emp_code" :value="employee.emp_code">
                    {{ employee.first_name }} {{ employee.last_name }} ({{ employee.emp_code }})
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input 
                  v-model="filters.start_time"
                  type="datetime-local" 
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input 
                  v-model="filters.end_time"
                  type="datetime-local" 
                  class="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>
            </div>
            <div class="flex space-x-2">
              <button 
                @click="applyFilters"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"></path>
                </svg>
                <span>Apply Filters</span>
              </button>
              <button 
                @click="clearFilters"
                class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Transactions Table -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <div>
              <h3 class="text-lg font-semibold text-gray-800">Transaction Records</h3>
              <p class="text-sm text-gray-600" v-if="selectedArea !== 'all'">
                Showing transactions for: {{ getSelectedAreaName() }}
              </p>
            </div>
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2 text-sm text-gray-600">
                <span>Page {{ currentPage }} of {{ totalPages }}</span>
                <span class="mx-2">•</span>
                <span>Showing {{ transactions.length }} of {{ pagination.count }} records</span>
              </div>
              <button 
                @click="fetchTransactions"
                :disabled="loading"
                class="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition duration-200 text-sm"
              >
                <svg v-if="loading" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                <span>{{ loading ? 'Refreshing...' : 'Refresh' }}</span>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verify Type</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="transaction in transactions" 
                  :key="transaction.id"
                  class="hover:bg-gray-50 transition duration-150"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span class="text-sm font-medium text-blue-600">
                          {{ getEmployeeInitials(transaction.emp_code) }}
                        </span>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ getEmployeeName(transaction.emp_code) }}
                        </div>
                        <div class="text-xs text-gray-500">{{ transaction.emp_code }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ formatDateTime(transaction.punch_time) }}</div>
                    <div class="text-xs text-gray-500">{{ formatTimeAgo(transaction.punch_time) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusClass(transaction.punch_state)]">
                      <span :class="['w-1.5 h-1.5 rounded-full mr-1.5', getStatusDotClass(transaction.punch_state)]"></span>
                      {{ getStatusText(transaction.punch_state) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ transaction.terminal_alias || transaction.terminal_sn || 'N/A' }}</div>
                    <div class="text-xs text-gray-500">{{ transaction.terminal_sn }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ transaction.area_alias || 'N/A' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getVerifyTypeText(transaction.verify_type) }}
                  </td>
                </tr>
                <tr v-if="transactions.length === 0 && !loading">
                  <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    <svg class="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="mt-2 text-lg font-medium text-gray-900">No transactions found</p>
                    <p class="text-sm">Try adjusting your filters or check back later.</p>
                  </td>
                </tr>
                <tr v-if="loading">
                  <td colspan="6" class="px-6 py-8 text-center">
                    <div class="flex items-center justify-center space-x-2">
                      <svg class="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="text-gray-600">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <span class="text-sm text-gray-700">Show</span>
              <select 
                v-model="filters.page_size" 
                @change="onPageSizeChange"
                class="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span class="text-sm text-gray-700">records per page</span>
            </div>
            <div class="flex items-center space-x-2">
              <button 
                @click="previousPage"
                :disabled="!pagination.previous || loading"
                class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Previous
              </button>
              <button 
                @click="nextPage"
                :disabled="!pagination.next || loading"
                class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from 'axios';

// Use local proxy server
const API_BASE = 'http://localhost:3001/api';

export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false,
      loading: false,
      error: '',
      proxyStatus: 'Using local proxy server for secure connection',
      credentials: {
        username: 'cdchris',
        password: 'Admin12345@'
      },
      token: '',
      transactions: [],
      filters: {
        emp_code: '',
        start_time: '',
        end_time: '',
        page: 1,
        page_size: 10
      },
      pagination: {
        count: 0,
        next: null,
        previous: null
      },
      lastUpdated: 'Never',
      autoRefresh: false,
      refreshInterval: null,
      lastFetchCount: 0,
      userInfo: {
        first_name: '',
        last_name: '',
        role: '',
        areas: []
      },
      userAreas: [],
      authorizedEmployees: [],
      selectedArea: 'all',
      employeeMap: new Map()
    };
  },
  computed: {
    currentPage() {
      return this.filters.page;
    },
    totalPages() {
      return Math.ceil(this.pagination.count / this.filters.page_size);
    },
    getCheckinCount() {
      return this.transactions.filter(t => t.punch_state === '0').length;
    },
    getCheckoutCount() {
      return this.transactions.filter(t => t.punch_state === '1').length;
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = '';

      try {
        const response = await axios.post(`${API_BASE}/api-token-auth/`, this.credentials, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data.token) {
          this.token = response.data.token;
          this.isAuthenticated = true;
          this.error = '';
          
          // Fetch user info and authorized areas
          await this.fetchUserInfo();
          await this.fetchAuthorizedAreas();
          await this.fetchAuthorizedEmployees();
          await this.fetchTransactions();
          this.startAutoRefresh();
        } else {
          this.error = 'Invalid credentials or server response';
        }
      } catch (error) {
        console.error('Login error:', error);
        
        if (error.response?.status === 400) {
          this.error = 'Invalid username or password';
        } else if (error.response?.status === 401) {
          this.error = 'Authentication failed';
        } else if (error.code === 'NETWORK_ERROR') {
          this.error = 'Cannot connect to proxy server. Make sure the proxy server is running on port 3001.';
        } else {
          this.error = `Login failed: ${error.message}`;
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchUserInfo() {
      try {
        const config = {
          headers: {
            'Authorization': `Token ${this.token}`
          }
        };

        // Get current user info
        const response = await axios.get(`${API_BASE}/auth/user/`, config);
        if (response.data) {
          this.userInfo = {
            first_name: response.data.first_name || this.credentials.username,
            last_name: response.data.last_name || '',
            role: response.data.role || 'Administrator',
            areas: response.data.areas || []
          };
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Fallback to basic info
        this.userInfo = {
          first_name: this.credentials.username,
          last_name: '',
          role: 'Administrator',
          areas: []
        };
      }
    },

    async fetchAuthorizedAreas() {
      try {
        const config = {
          headers: {
            'Authorization': `Token ${this.token}`
          }
        };

        // Get areas that the user has access to
        const response = await axios.get(`${API_BASE}/personnel/api/areas/`, config);
        if (response.data && Array.isArray(response.data.data)) {
          this.userAreas = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          this.userAreas = response.data;
        } else {
          // If no specific areas returned, assume access to all areas
          this.userAreas = [{ id: 'all', area_name: 'All Areas' }];
        }
      } catch (error) {
        console.error('Error fetching authorized areas:', error);
        this.userAreas = [{ id: 'all', area_name: 'All Areas' }];
      }
    },

    async fetchAuthorizedEmployees() {
    try {
      const config = {
        headers: {
          'Authorization': `Token ${this.token}`
        }
      };

    // Get employees from authorized areas
    let allEmployees = [];
    let page = 1;
    const pageSize = 100;
    let hasMorePages = true;

    while (hasMorePages) {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString()
      });

      if (this.selectedArea !== 'all') {
        params.append('area', this.selectedArea);
      }

      const response = await axios.get(`${API_BASE}/personnel/api/employees/?${params}`, config);
      
      if (response.data && Array.isArray(response.data.data)) {
        allEmployees = [...allEmployees, ...response.data.data];
      } else if (response.data && Array.isArray(response.data)) {
        allEmployees = [...allEmployees, ...response.data];
      }

      // Check if there are more pages
      if (!response.data.next) {
        hasMorePages = false;
      } else {
        page++;
      }
    }

    this.authorizedEmployees = allEmployees;
    
    // Create employee map for quick lookup
    this.employeeMap.clear();
    allEmployees.forEach(employee => {
      this.employeeMap.set(employee.emp_code, employee);
    });

  } catch (error) {
    console.error('Error fetching authorized employees:', error);
    this.authorizedEmployees = [];
  }
},

    async fetchTransactions() {
      this.loading = true;
      this.error = '';

      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${this.token}`
          },
          timeout: 15000
        };

        const params = new URLSearchParams();
        Object.keys(this.filters).forEach(key => {
          if (this.filters[key]) {
            params.append(key, this.filters[key]);
          }
        });

        // Add area filter if specific area is selected
        if (this.selectedArea !== 'all') {
          params.append('area', this.selectedArea);
        }

        const response = await axios.get(`${API_BASE}/iclock/api/transactions/?${params}`, config);
        
        if (response.data.code === 0) {
          const newTransactions = response.data.data || [];
          const newCount = response.data.count || 0;
          
          // Check if there are new records
          if (newCount > this.lastFetchCount && this.lastFetchCount > 0) {
            this.showNewRecordsNotification(newCount - this.lastFetchCount);
          }
          
          this.transactions = newTransactions;
          this.pagination = {
            count: newCount,
            next: response.data.next,
            previous: response.data.previous
          };
          this.lastFetchCount = newCount;
          this.lastUpdated = new Date().toLocaleTimeString();
        } else {
          this.error = response.data.msg || 'Failed to fetch transactions';
        }
      } catch (error) {
        this.error = 'Failed to fetch transactions. Please try again.';
        console.error('Fetch transactions error:', error);
        
        if (error.response && error.response.status === 401) {
          this.logout();
        }
      } finally {
        this.loading = false;
      }
    },

    getEmployeeName(empCode) {
      const employee = this.employeeMap.get(empCode);
      if (employee) {
        return `${employee.first_name} ${employee.last_name}`;
      }
      return empCode || 'Unknown Employee';
    },

    getEmployeeInitials(empCode) {
      const employee = this.employeeMap.get(empCode);
      if (employee) {
        return `${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}`.toUpperCase() || 'U';
      }
      return empCode?.charAt(0) || 'U';
    },

    getSelectedAreaName() {
      if (this.selectedArea === 'all') {
        return 'All Areas';
      }
      const area = this.userAreas.find(a => a.id === this.selectedArea);
      return area ? area.area_name : 'Unknown Area';
    },

    onAreaChange() {
      this.filters.page = 1;
      this.fetchAuthorizedEmployees();
      this.fetchTransactions();
    },

    showNewRecordsNotification(count) {
      // Create a temporary notification
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce';
      notification.innerHTML = `
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>${count} new record${count > 1 ? 's' : ''} added!</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },

    logout() {
      this.isAuthenticated = false;
      this.token = '';
      this.transactions = [];
      this.credentials.password = '';
      this.error = '';
      this.stopAutoRefresh();
      this.clearFilters();
      this.userAreas = [];
      this.authorizedEmployees = [];
      this.employeeMap.clear();
    },

    clearFilters() {
      this.filters.emp_code = '';
      this.filters.start_time = '';
      this.filters.end_time = '';
      this.filters.page = 1;
    },

    applyFilters() {
      this.filters.page = 1;
      this.fetchTransactions();
    },

    toggleAutoRefresh() {
      this.autoRefresh = !this.autoRefresh;
      if (this.autoRefresh) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    },

    startAutoRefresh() {
      this.stopAutoRefresh(); // Clear any existing interval
      this.refreshInterval = setInterval(() => {
        if (this.isAuthenticated && !this.loading) {
          this.fetchTransactions();
        }
      }, 10000); // Refresh every 10 seconds
    },

    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },

    nextPage() {
      if (this.pagination.next && !this.loading) {
        this.filters.page++;
        this.fetchTransactions();
      }
    },

    previousPage() {
      if (this.pagination.previous && !this.loading) {
        this.filters.page--;
        this.fetchTransactions();
      }
    },

    onPageSizeChange() {
      this.filters.page = 1;
      this.fetchTransactions();
    },

    formatDateTime(dateTime) {
      if (!dateTime) return 'N/A';
      return new Date(dateTime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    formatTimeAgo(dateTime) {
      if (!dateTime) return '';
      const now = new Date();
      const then = new Date(dateTime);
      const diff = now - then;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);
      const days = Math.floor(diff / 86400000);

      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      return 'Just now';
    },

    getStatusText(punchState) {
      const states = {
        '0': 'Check-in',
        '1': 'Check-out',
        '2': 'Break Start',
        '3': 'Break End'
      };
      return states[punchState] || `Unknown (${punchState})`;
    },

    getStatusClass(punchState) {
      const classes = {
        '0': 'bg-green-100 text-green-800',
        '1': 'bg-blue-100 text-blue-800',
        '2': 'bg-yellow-100 text-yellow-800',
        '3': 'bg-purple-100 text-purple-800'
      };
      return classes[punchState] || 'bg-gray-100 text-gray-800';
    },

    getStatusDotClass(punchState) {
      const classes = {
        '0': 'bg-green-400',
        '1': 'bg-blue-400',
        '2': 'bg-yellow-400',
        '3': 'bg-purple-400'
      };
      return classes[punchState] || 'bg-gray-400';
    },

    getVerifyTypeText(verifyType) {
      const types = {
        '0': 'Password',
        '1': 'Fingerprint',
        '2': 'Card',
        '3': 'Face',
        '4': 'Finger Vein',
        '5': 'Palm',
        '15': 'Selfie Check'
      };
      return types[verifyType] || `Type ${verifyType}`;
    }
  },

  beforeUnmount() {
    this.stopAutoRefresh();
  }
};
</script>