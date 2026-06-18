import client from "./client";

export const adminApi = {
    getStats: async () => {
        return client.get("/api/admin/stats");
    },

    getUsers: async (page = 1, limit = 10, search = "") => {
        return client.get("/api/admin/users", {
            params: { page, limit, search }
        });
    },

    deleteUser: async (id) => {
        return client.delete(`/api/admin/users/${id}`);
    },

    // Analysis Management
    getAllAnalyses: async (page = 1, limit = 20) => {
        return client.get("/api/analysis/admin/analyses", {
            params: { page, limit }
        });
    },

    deleteAnalysis: async (id) => {
        return client.delete(`/api/analysis/${id}`);
    },

    updateAnalysis: async (id, data) => {
        return client.put(`/api/analysis/${id}`, data);
    }
};
