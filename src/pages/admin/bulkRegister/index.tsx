import {
  DeleteOutlined,
  SaveOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Result,
  Select,
  Table,
  Tabs,
  Tag,
  Typography,
  DatePicker,
  Upload,
} from "antd";
import type { UploadFile } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRoleAccess } from "../../../hooks/useRoleAccess";
import type { RootState } from "../../../redux/store";
import AuthServices from "../../../services/auth/api.service";
import type {
  BulkRegisterResponse,
  RegisterUserRequest,
  RegisterUserResponse,
} from "../../../types/Auth";
import {
  getUniversityManagementContract,
  mapRoleToEnum,
} from "../../../blockchain/user";
import { updateUserOnChainApi } from "../../../services/admin/users/api";
import type { CurriculumListItem } from "../../../types/Curriculum";
import { fetchCurriculumsApi } from "../../../services/admin/curriculums/api";
import type { SpecializationDto } from "../../../types/Specialization";
import { fetchSpecializationsApi } from "../../../services/admin/specializations/api";
import "./index.scss";

const { Title, Text } = Typography;
// Ant Design v5: use Tabs items and Select options API

interface UserFormData extends RegisterUserRequest {
  key?: string;
}

const BulkRegister: React.FC = () => {
  const [users, setUsers] = useState<UserFormData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BulkRegisterResponse | null>(null);
  const [curriculums, setCurriculums] = useState<CurriculumListItem[]>([]);
  const [curriculumsLoading, setCurriculumsLoading] = useState(false);
  const [curriculumError, setCurriculumError] = useState<string | null>(null);
  const [specializations, setSpecializations] = useState<SpecializationDto[]>(
    []
  );
  const [specializationsLoading, setSpecializationsLoading] = useState(false);
  const [specializationsError, setSpecializationsError] = useState<
    string | null
  >(null);
  const [onChainLoadingMap, setOnChainLoadingMap] = useState<
    Record<string, boolean>
  >({});
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { isAdmin, userProfile } = useRoleAccess();
  const isAdminUser = isAdmin();
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // Check authentication and admin role on mount
  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      toast.error("Vui lòng đăng nhập để truy cập trang này");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (!isAdminUser) {
      toast.error("Chỉ quản trị viên mới có thể đăng ký hàng loạt người dùng");
      setTimeout(() => {
        navigate(-1); // Go back to previous page
      }, 2000);
    }

    const debugContract = async () => {
      try {
        const contract = await getUniversityManagementContract();
        // nếu contract có owner()
        if ((contract as any).owner) {
          const owner = await (contract as any).owner();
          console.log("on-chain owner:", owner);
        }
        if ((contract as any).initialized) {
          const initialized = await (contract as any).initialized();
          console.log("initialized:", initialized);
        }
        const totalUsers = await (contract as any).getTotalUsers();
        console.log("totalUsers:", totalUsers.toString());
      } catch (e) {
        console.error("DEBUG CONTRACT ERROR:", e);
      }
    };

    debugContract();
  }, [isAuthenticated, accessToken, isAdminUser, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !accessToken || !isAdminUser) {
      return;
    }

    let isMounted = true;

    const loadCurriculums = async () => {
      setCurriculumsLoading(true);
      try {
        const data = await fetchCurriculumsApi();
        if (isMounted) {
          setCurriculums(data);
          setCurriculumError(null);
        }
      } catch (error) {
        console.error("Failed to load curriculums:", error);
        if (isMounted) {
          setCurriculumError(
            "Không thể tải danh sách khung chương trình. Vui lòng thử lại sau."
          );
          message.error("Không thể tải danh sách khung chương trình");
        }
      } finally {
        if (isMounted) {
          setCurriculumsLoading(false);
        }
      }
    };

    const loadSpecializations = async () => {
      setSpecializationsLoading(true);
      try {
        const response = await fetchSpecializationsApi({
          pageNumber: 1,
          pageSize: 200,
        });
        const items = response.data || [];
        if (isMounted) {
          setSpecializations(items);
          setSpecializationsError(null);
        }
      } catch (error) {
        console.error("Failed to load specializations:", error);
        if (isMounted) {
          setSpecializationsError(
            "Không thể tải danh sách chuyên ngành. Vui lòng thử lại sau."
          );
          message.error("Không thể tải danh sách chuyên ngành");
        }
      } finally {
        if (isMounted) {
          setSpecializationsLoading(false);
        }
      }
    };

    loadCurriculums();
    loadSpecializations();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, accessToken, isAdminUser]);

  const curriculumMap = useMemo(() => {
    const map = new Map<number, CurriculumListItem>();
    curriculums.forEach((curriculum) => {
      map.set(curriculum.id, curriculum);
    });
    return map;
  }, [curriculums]);

  const curriculumCodeMap = useMemo(() => {
    const map = new Map<string, CurriculumListItem>();
    curriculums.forEach((curriculum) => {
      if (curriculum.code) {
        map.set(curriculum.code.toLowerCase(), curriculum);
      }
    });
    return map;
  }, [curriculums]);

  const curriculumOptions = useMemo(
    () =>
      curriculums.map((curriculum) => ({
        label: `${curriculum.code} - ${curriculum.name}`,
        value: curriculum.id,
      })),
    [curriculums]
  );

  const specializationOptions = useMemo(
    () =>
      specializations.map((spec) => ({
        label: `${spec.code} - ${spec.name}`,
        value: spec.id, // Use ID instead of code/name for backend
      })),
    [specializations]
  );

  const getCurriculumLabel = useCallback(
    (curriculumId?: number) => {
      if (!curriculumId) {
        return "-";
      }
      const curriculum = curriculumMap.get(curriculumId);
      if (curriculum) {
        return `${curriculum.code} - ${curriculum.name}`;
      }
      return `#${curriculumId}`;
    },
    [curriculumMap]
  );

  const resolveCurriculumId = useCallback(
    (value?: string | number | null) => {
      if (value === undefined || value === null || value === "") {
        return undefined;
      }

      if (typeof value === "number" && !Number.isNaN(value)) {
        return value;
      }

      const numeric = Number(value);
      if (!Number.isNaN(numeric) && numeric > 0) {
        return numeric;
      }

      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (!normalized) {
          return undefined;
        }

        const byCode = curriculumCodeMap.get(normalized);
        if (byCode) {
          return byCode.id;
        }

        const byName = curriculums.find(
          (curriculum) => curriculum.name.toLowerCase() === normalized
        );
        return byName?.id;
      }

      return undefined;
    },
    [curriculums, curriculumCodeMap]
  );

  const pickCurriculumValue = useCallback((record: Record<string, any>) => {
    return (
      record.CurriculumId ??
      record.curriculumId ??
      record.CurriculumID ??
      record["Curriculum ID"] ??
      record["curriculum id"] ??
      record.CurriculumCode ??
      record.curriculumCode ??
      record["Curriculum Code"] ??
      record.curriculum ??
      record.Curriculum
    );
  }, []);

  const handleAddUser = (values: any) => {
    const newUser: UserFormData = {
      fullName: values.fullName,
      email: values.email,
      password: values.password,
      roleName: values.roleName as "Student" | "Teacher",
      key: `user-${Date.now()}-${Math.random()}`,
    };

    if (values.walletAddress) {
      newUser.walletAddress = String(values.walletAddress).trim();
    }

    if (values.roleName === "Student") {
      if (values.studentCode) newUser.studentCode = values.studentCode;
      if (values.enrollmentDate) {
        newUser.enrollmentDate = dayjs(values.enrollmentDate).toISOString();
      }
      if (values.curriculumId) {
        const resolvedId = Number(values.curriculumId);
        if (!Number.isNaN(resolvedId)) {
          newUser.curriculumId = resolvedId;
        }
      }
      if (values.phoneNumber) newUser.phoneNumber = values.phoneNumber;
    } else if (values.roleName === "Teacher") {
      if (values.teacherCode) newUser.teacherCode = values.teacherCode;
      if (values.hireDate) {
        newUser.hireDate = dayjs(values.hireDate).toISOString();
      }
      if (values.specializationIds && Array.isArray(values.specializationIds)) {
        // Gửi đúng ID chuyên ngành (Guid/string) như từ Select
        newUser.specializationIds = values.specializationIds.map((id: any) =>
          String(id)
        );
      }
      // Keep backward compatibility with old specialization field
      if (values.specialization && !values.specializationIds) {
        newUser.specialization = values.specialization;
      }
      if (values.phoneNumber) newUser.phoneNumber = values.phoneNumber;
    }

    setUsers([...users, newUser]);
    form.resetFields();
    message.success("Đã thêm người dùng vào danh sách!");
  };

  const handleRemoveUser = (key: string) => {
    setUsers(users.filter((u) => u.key !== key));
  };

  const handleBulkRegister = async () => {
    if (users.length === 0) {
      message.warning("Vui lòng thêm ít nhất một người dùng!");
      return;
    }

    setIsLoading(true);
    const hideLoading = message.loading(
      `Đang đăng ký ${users.length} người dùng... Vui lòng đợi trong giây lát.`,
      0
    );

    try {
      // Remove 'key' field before sending to API
      const request = {
        users: users.map(({ key, ...user }) => user),
      };

      console.log("Bulk Register Request (sanitized):", request);

      // Retry logic for timeout errors
      let retries = 2;
      let lastError: any;

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          if (attempt > 0) {
            message.info(`Thử lại lần ${attempt}/${retries}...`);
          }

          const response = await AuthServices.bulkRegister(request);
          console.log("Bulk Register Response:", response);

          // Enrich results with all fields from original users list
          const enrichedResults = response.results.map(
            (result: RegisterUserResponse) => {
              const originalUser = users.find((u) => u.email === result.email);
              return {
                ...result,
                fullName: originalUser?.fullName || result.fullName,
                phoneNumber: originalUser?.phoneNumber || result.phoneNumber,
                studentCode: originalUser?.studentCode || result.studentCode,
                teacherCode: originalUser?.teacherCode || result.teacherCode,
                enrollmentDate:
                  originalUser?.enrollmentDate || result.enrollmentDate,
                hireDate: originalUser?.hireDate || result.hireDate,
                specialization:
                  originalUser?.specialization || result.specialization,
                specializationIds: originalUser?.specializationIds,
                curriculumId: originalUser?.curriculumId ?? result.curriculumId,
              };
            }
          );

          setResult({
            ...response,
            results: enrichedResults,
          });
          hideLoading();

          if (response.statistics.success > 0) {
            toast.success(
              `Đã đăng ký thành công ${response.statistics.success}/${response.statistics.total} người dùng!`
            );
          }
          if (response.statistics.failed > 0) {
            toast.warning(
              `${response.statistics.failed} người dùng đăng ký thất bại!`
            );
          }
          return; // Success, exit function
        } catch (err: any) {
          lastError = err;

          // Check if it's a timeout error
          const isTimeout =
            err.code === "ECONNABORTED" ||
            err.message?.includes("timeout") ||
            err.message?.includes("exceeded");

          // If not timeout or last attempt, throw error
          if (!isTimeout || attempt === retries) {
            throw err;
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (attempt + 1))
          );
        }
      }

      // If we get here, all retries failed
      throw lastError;
    } catch (error: any) {
      hideLoading();
      console.error("Bulk Register Error:", error);
      console.error("Error Response:", error.response?.data);

      // Check if it's a timeout error
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        toast.error(
          `Hết thời gian chờ. Máy chủ đang mất quá nhiều thời gian để xử lý ${users.length} người dùng. ` +
            "Vui lòng thử đăng ký ít người dùng hơn mỗi lần (ví dụ: 10-20 người dùng mỗi lần)."
        );
      }
      // Check if we have error response with results (partial or full failure)
      else if (error.response?.data) {
        const errorData = error.response.data;

        // Handle both new format (statistics) and old format (successCount/failureCount)
        const stats = errorData.statistics || {
          total: errorData.totalRequested || 0,
          success: errorData.successCount || 0,
          failed: errorData.failureCount || 0,
        };

        // Enrich error results with all fields from original users list
        const enrichedResults = (errorData.results || []).map(
          (result: RegisterUserResponse) => {
            const originalUser = users.find((u) => u.email === result.email);
            return {
              ...result,
              fullName: originalUser?.fullName || result.fullName,
              phoneNumber: originalUser?.phoneNumber || result.phoneNumber,
              studentCode: originalUser?.studentCode || result.studentCode,
              teacherCode: originalUser?.teacherCode || result.teacherCode,
              enrollmentDate:
                originalUser?.enrollmentDate || result.enrollmentDate,
              hireDate: originalUser?.hireDate || result.hireDate,
              specialization:
                originalUser?.specialization || result.specialization,
              specializationIds: originalUser?.specializationIds,
              curriculumId: originalUser?.curriculumId ?? result.curriculumId,
            };
          }
        );

        // Transform the response to match expected format
        const transformedResult: BulkRegisterResponse = {
          success: errorData.success !== false, // Keep success flag if exists
          message: errorData.message || "Đăng ký hoàn tất nhưng có lỗi",
          statistics: stats,
          results: enrichedResults,
        };

        setResult(transformedResult);

        // Show appropriate toast message
        if (stats.success > 0 && stats.failed > 0) {
          toast.warning(
            `Hoàn tất một phần: ${stats.success}/${stats.total} người dùng đăng ký thành công. ` +
              `${stats.failed} thất bại. Kiểm tra bảng kết quả để xem chi tiết.`
          );
        } else if (stats.failed > 0) {
          toast.error(
            `Tất cả ${stats.failed} người dùng đăng ký thất bại. Kiểm tra bảng kết quả để xem chi tiết.`
          );
        } else {
          toast.error(errorData.message || "Đăng ký thất bại");
        }
      }
      // Generic error without response data
      else {
        const errorMessage =
          error.message || "Không thể đăng ký người dùng. Vui lòng thử lại!";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterUserOnChain = async (record: RegisterUserResponse) => {
    if (!record.userId) {
      message.error("Thiếu userId, không thể đăng ký on-chain.");
      return;
    }

    const key = record.userId;
    setOnChainLoadingMap((prev) => ({ ...prev, [key]: true }));

    try {
      const walletAddress = record.walletAddress;
      if (!walletAddress) {
        throw new Error("User chưa có ví (walletAddress) để đăng ký on-chain.");
      }

      const contract = await getUniversityManagementContract();
      const roleEnum = mapRoleToEnum(record.roleName);

      const tx = await contract.registerUser(
        walletAddress,
        record.userId,
        record.fullName || record.email,
        record.email,
        roleEnum
      );

      const receipt = await tx.wait();
      const txHash = receipt.hash as string;
      const blockNumber = Number(receipt.blockNumber);

      await updateUserOnChainApi(record.userId, {
        transactionHash: txHash,
      });

      message.success(`Đã đăng ký on-chain. Tx: ${txHash}`);

      setResult((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          results: prev.results.map((r) =>
            r.email === record.email
              ? {
                  ...r,
                  blockchainTxHash: txHash,
                  blockNumber,
                  isOnBlockchain: true,
                }
              : r
          ),
        };
      });
    } catch (error: any) {
      console.error(error);
      message.error(error?.message || "Không thể đăng ký user on-chain");
    } finally {
      setOnChainLoadingMap((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Determine if we should show curriculum or specialization column
  const hasStudents = useMemo(
    () => users.some((u) => u.roleName === "Student"),
    [users]
  );
  const hasTeachers = useMemo(
    () => users.some((u) => u.roleName === "Teacher"),
    [users]
  );

  const userColumns = useMemo(() => {
    const baseColumns: ColumnsType<UserFormData> = [
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 280,
      },
      {
        title: "Họ và tên",
        dataIndex: "fullName",
        key: "fullName",
        width: 150,
      },
      {
        title: "Vai trò",
        dataIndex: "roleName",
        key: "roleName",
        width: 100,
        render: (role: string) => (
          <Tag color={role === "Student" ? "blue" : "green"}>
            {role === "Student" ? "Sinh viên" : "Giảng viên"}
          </Tag>
        ),
      },
    ];

    // Chỉ hiển thị "Khung chương trình" nếu có Student
    if (hasStudents) {
      baseColumns.push({
        title: "Khung chương trình",
        dataIndex: "curriculumId",
        key: "curriculumId",
        width: 200,
        render: (_: any, record: UserFormData) =>
          record.roleName === "Student"
            ? getCurriculumLabel(record.curriculumId)
            : "-",
      });
    }

    baseColumns.push({
      title: "Mã",
      key: "code",
      width: 100,
      render: (_: any, record: UserFormData) => (
        <span>{record.studentCode || record.teacherCode || "-"}</span>
      ),
    });

    baseColumns.push({
      title: "Ngày",
      key: "date",
      width: 120,
      render: (_: any, record: UserFormData) => {
        const date = record.enrollmentDate || record.hireDate;
        return date ? dayjs(date).format("YYYY-MM-DD") : "-";
      },
    });

    // Chỉ hiển thị "Chuyên ngành" nếu có Teacher
    if (hasTeachers) {
      baseColumns.push({
        title: "Chuyên ngành",
        dataIndex: "specializationIds",
        key: "specializationIds",
        width: 200,
        render: (_: string, record: UserFormData) => {
          if (
            record.specializationIds &&
            Array.isArray(record.specializationIds) &&
            record.specializationIds.length > 0
          ) {
            const specNames = record.specializationIds
              .map((id) => {
                const spec = specializations.find((s) => s.id === id);
                return spec ? `${spec.code} - ${spec.name}` : null;
              })
              .filter((name) => name !== null);
            return specNames.length > 0 ? specNames.join(", ") : "-";
          }
          // Fallback về specialization string cũ
          return record.specialization || "-";
        },
      });
    }

    baseColumns.push(
      {
        title: "Số điện thoại",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        width: 120,
        render: (text: string) => text || "-",
      },
      {
        title: "Wallet Address",
        dataIndex: "walletAddress",
        key: "walletAddress",
        width: 260,
        render: (text: string) => text || "-",
      },
      {
        title: "Thao tác",
        key: "action",
        width: 100,
        fixed: "right" as const,
        render: (_: any, record: UserFormData) => (
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveUser(record.key!)}
          >
            Remove
          </Button>
        ),
      }
    );

    return baseColumns;
  }, [users, hasStudents, hasTeachers, specializations, getCurriculumLabel]);

  // Determine if result has students or teachers
  const resultHasStudents = useMemo(
    () => result?.results?.some((r) => r.roleName === "Student") || false,
    [result]
  );
  const resultHasTeachers = useMemo(
    () => result?.results?.some((r) => r.roleName === "Teacher") || false,
    [result]
  );

  const resultColumns = useMemo(() => {
    const baseColumns: ColumnsType<RegisterUserResponse> = [
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: 200,
      },
      {
        title: "Họ và tên",
        dataIndex: "fullName",
        key: "fullName",
        width: 200,
        render: (text: string) => text || "-",
      },
      {
        title: "Vai trò",
        dataIndex: "roleName",
        key: "roleName",
        width: 100,
      },
    ];

    // Chỉ hiển thị "Khung chương trình" nếu có Student trong kết quả
    if (resultHasStudents) {
      baseColumns.push({
        title: "Khung chương trình",
        dataIndex: "curriculumId",
        key: "curriculumId",
        width: 200,
        render: (_: any, record: RegisterUserResponse) =>
          record.roleName === "Student"
            ? getCurriculumLabel(record.curriculumId)
            : "-",
      });
    }

    baseColumns.push({
      title: "Mã",
      key: "code",
      width: 100,
      render: (_: any, record: RegisterUserResponse) => (
        <span>{record.studentCode || record.teacherCode || "-"}</span>
      ),
    });

    baseColumns.push({
      title: "Ngày",
      key: "date",
      width: 150,
      render: (_: any, record: RegisterUserResponse) => {
        const date = record.enrollmentDate || record.hireDate;
        return date ? dayjs(date).format("YYYY-MM-DD") : "-";
      },
    });

    baseColumns.push({
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      width: 120,
      render: (text: string) => text || "-",
    });

    // Chỉ hiển thị "Chuyên ngành" nếu có Teacher trong kết quả
    if (resultHasTeachers) {
      baseColumns.push({
        title: "Chuyên ngành",
        dataIndex: "specializationIds",
        key: "specializationIds",
        width: 280,
        render: (_: string, record: RegisterUserResponse) => {
          // Nếu có specializationIds trong original user, hiển thị từ array
          const originalUser = users.find((u) => u.email === record.email);
          if (
            originalUser?.specializationIds &&
            Array.isArray(originalUser.specializationIds) &&
            originalUser.specializationIds.length > 0
          ) {
            const specNames = originalUser.specializationIds
              .map((id) => {
                const spec = specializations.find((s) => s.id === id);
                return spec ? `${spec.code} - ${spec.name}` : null;
              })
              .filter((name) => name !== null);
            return specNames.length > 0 ? specNames.join(", ") : "-";
          }
          // Fallback về specialization string cũ
          return record.specialization || "-";
        },
      });
    }

    baseColumns.push(
      {
        title: "Wallet Address",
        dataIndex: "walletAddress",
        key: "walletAddress",
        width: 260,
        render: (text: string) => text || "-",
      },
      {
        title: "Trạng thái",
        key: "status",
        width: 100,
        render: (_: any, record: RegisterUserResponse) => (
          <Tag color={record.success ? "success" : "error"}>
            {record.success ? "Thành công" : "Thất bại"}
          </Tag>
        ),
      },
      {
        title: "On-chain?",
        key: "onchain",
        width: 120,
        render: (_: any, record: RegisterUserResponse) => (
          <Tag color={record.isOnBlockchain ? "green" : "default"}>
            {record.isOnBlockchain ? "On-chain" : "Off-chain"}
          </Tag>
        ),
      },
      {
        title: "Thông báo",
        key: "message",
        width: 400,
        render: (_: any, record: RegisterUserResponse) => {
          // Combine message and errors array
          const messages: string[] = [];

          if (record.message) {
            messages.push(record.message);
          }

          if (
            record.errors &&
            Array.isArray(record.errors) &&
            record.errors.length > 0
          ) {
            messages.push(...record.errors);
          }

          return (
            <div>
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{ marginBottom: index < messages.length - 1 ? 4 : 0 }}
                >
                  {record.success ? (
                    <Text>{msg}</Text>
                  ) : (
                    <Text type="danger">{msg}</Text>
                  )}
                </div>
              ))}
            </div>
          );
        },
      },
      {
        title: "Hành động on-chain",
        key: "onchain_action",
        width: 200,
        render: (_: any, record: RegisterUserResponse) => {
          if (!record.success) {
            return <Text type="secondary">Đăng ký off-chain thất bại</Text>;
          }

          if (record.isOnBlockchain) {
            if (record.blockchainTxHash) {
              return (
                <div>
                  <Text type="success">Đã on-chain</Text>
                  <br />
                  <Text type="secondary">Tx: {record.blockchainTxHash}</Text>
                </div>
              );
            }
            return <Text type="success">Đã on-chain</Text>;
          }

          if (!record.userId || !record.walletAddress) {
            return <Text type="warning">Thiếu userId hoặc ví</Text>;
          }

          const loading = onChainLoadingMap[record.userId] === true;

          return (
            <Button
              type="primary"
              size="small"
              loading={loading}
              onClick={() => handleRegisterUserOnChain(record)}
            >
              Đăng ký on-chain
            </Button>
          );
        },
      }
    );

    return baseColumns;
  }, [
    result,
    resultHasStudents,
    resultHasTeachers,
    users,
    specializations,
    getCurriculumLabel,
    onChainLoadingMap,
    handleRegisterUserOnChain,
  ]);

  // Show error if not authenticated
  if (!isAuthenticated || !accessToken) {
    return (
      <div className="bulk-register-container">
        <Card>
          <Result
            status="403"
            title="Yêu cầu xác thực"
            subTitle="Vui lòng đăng nhập để truy cập trang này"
            extra={
              <Button type="primary" onClick={() => navigate("/login")}>
                Đi đến trang đăng nhập
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  // Show error if not admin
  if (!isAdminUser) {
    return (
      <div className="bulk-register-container">
        <Card>
          <Result
            status="403"
            title="Truy cập bị từ chối"
            subTitle="Chỉ quản trị viên mới có thể đăng ký hàng loạt người dùng"
            extra={
              <Button type="primary" onClick={() => navigate(-1)}>
                Quay lại
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="bulk-register-container">
      <Card>
        <div className="bulk-register-header">
          <Title level={2}>
            <UserAddOutlined style={{ color: "#3674B5", marginRight: 8 }} /> Đăng ký hàng loạt người dùng
          </Title>
        </div>

        <Alert
          message="Chỉ dành cho quản trị viên"
          description={`Bạn đang đăng nhập với tư cách ${userProfile?.fullName} (${userProfile?.role}). Chỉ quản trị viên mới có thể đăng ký hàng loạt người dùng.`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        {curriculumError && (
          <Alert
            message="Danh sách khung chương trình không khả dụng"
            description={curriculumError}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        <Tabs
          defaultActiveKey="manual"
          items={[
            {
              key: "manual",
              label: "Nhập thủ công",
              children: (
                <>
                  <Form
                    form={form}
                    onFinish={handleAddUser}
                    layout="vertical"
                    size="large"
                  >
                    <Form.Item
                      label="Vai trò"
                      name="roleName"
                      rules={[
                        { required: true, message: "Vui lòng chọn vai trò!" },
                      ]}
                    >
                      <Select
                        placeholder="Chọn vai trò"
                        options={[
                          { label: "Sinh viên", value: "Student" },
                          { label: "Giảng viên", value: "Teacher" },
                        ]}
                      />
                    </Form.Item>

                    <Form.Item
                      label="Họ và tên"
                      name="fullName"
                      rules={[
                        { required: true, message: "Vui lòng nhập họ và tên!" },
                      ]}
                    >
                      <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                      label="Email"
                      name="email"
                      rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        {
                          type: "email",
                          message: "Định dạng email không hợp lệ!",
                        },
                      ]}
                    >
                      <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item
                      label="Mật khẩu"
                      name="password"
                      rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu!" },
                        {
                          min: 6,
                          message: "Mật khẩu phải có ít nhất 6 ký tự!",
                        },
                      ]}
                    >
                      <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>

                    <Form.Item
                      label="Địa chỉ ví (MetaMask)"
                      name="walletAddress"
                      rules={[
                        {
                          pattern: /^0x[a-fA-F0-9]{40}$/,
                          message: "Địa chỉ ví không hợp lệ",
                        },
                      ]}
                    >
                      <Input placeholder="0x... (tùy chọn, có thể để trống)" />
                    </Form.Item>

                    {/* Conditional fields based on role */}
                    <Form.Item shouldUpdate noStyle>
                      {({ getFieldValue }) => {
                        const role = getFieldValue("roleName");
                        if (role === "Student") {
                          return (
                            <>
                              <Form.Item
                                label="Mã sinh viên"
                                name="studentCode"
                              >
                                <Input placeholder="Nhập mã sinh viên" />
                              </Form.Item>
                              <Form.Item
                                label="Ngày nhập học"
                                name="enrollmentDate"
                              >
                                <DatePicker style={{ width: "100%" }} />
                              </Form.Item>
                              <Form.Item
                                label="Khung chương trình"
                                name="curriculumId"
                                rules={[
                                  {
                                    required: true,
                                    message:
                                      "Vui lòng chọn khung chương trình!",
                                  },
                                ]}
                                extra={curriculumError || undefined}
                              >
                                <Select
                                  placeholder={
                                    curriculumsLoading
                                      ? "Đang tải khung chương trình..."
                                      : "Chọn khung chương trình"
                                  }
                                  loading={curriculumsLoading}
                                  options={curriculumOptions}
                                  showSearch
                                  optionFilterProp="label"
                                  disabled={!curriculums.length}
                                />
                              </Form.Item>
                              <Form.Item
                                label="Số điện thoại"
                                name="phoneNumber"
                              >
                                <Input placeholder="Nhập số điện thoại" />
                              </Form.Item>
                            </>
                          );
                        }
                        if (role === "Teacher") {
                          return (
                            <>
                              <Form.Item
                                label="Mã giảng viên"
                                name="teacherCode"
                              >
                                <Input placeholder="Nhập mã giảng viên" />
                              </Form.Item>
                              <Form.Item
                                label="Ngày tuyển dụng"
                                name="hireDate"
                              >
                                <DatePicker style={{ width: "100%" }} />
                              </Form.Item>
                              <Form.Item
                                label="Chuyên ngành"
                                name="specializationIds"
                                extra={specializationsError || undefined}
                                rules={[
                                  {
                                    required: true,
                                    message:
                                      "Vui lòng chọn ít nhất 1 chuyên ngành!",
                                  },
                                ]}
                              >
                                <Select
                                  mode="multiple"
                                  placeholder={
                                    specializationsLoading
                                      ? "Đang tải chuyên ngành..."
                                      : "Chọn chuyên ngành (có thể chọn nhiều)"
                                  }
                                  loading={specializationsLoading}
                                  options={specializationOptions}
                                  showSearch
                                  optionFilterProp="label"
                                  allowClear
                                  disabled={!specializations.length}
                                />
                              </Form.Item>
                              <Form.Item
                                label="Số điện thoại"
                                name="phoneNumber"
                              >
                                <Input placeholder="Nhập số điện thoại" />
                              </Form.Item>
                            </>
                          );
                        }
                        return null;
                      }}
                    </Form.Item>

                    <Form.Item>
                      <Button type="dashed" htmlType="submit" block>
                        Thêm vào danh sách
                      </Button>
                    </Form.Item>
                  </Form>

                  <Divider>Danh sách người dùng ({users.length})</Divider>

                  <Table
                    dataSource={users}
                    columns={userColumns}
                    pagination={false}
                    size="small"
                    rowKey={(r) => r.key!}
                    scroll={{ x: 1400 }}
                  />

                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {users.length > 0 && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setUsers([]);
                          message.success("Cleared all users from list");
                        }}
                        block
                      >
                        Xóa tất cả
                      </Button>
                    )}
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleBulkRegister}
                      loading={isLoading}
                      disabled={users.length === 0}
                      block
                      size="large"
                    >
                      Đăng ký tất cả ({users.length} người dùng)
                    </Button>
                  </div>
                </>
              ),
            },
            {
              key: "upload",
              label: "Tải lên file",
              children: (
                <>
                  <Alert
                    message="Tải lên file CSV/Excel"
                    description="Tải lên file CSV hoặc Excel chứa thông tin người dùng. File cần có các cột: Email, FullName, Password, Role (Student/Teacher), và các trường tùy chọn tùy theo vai trò."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />

                  <Card style={{ marginBottom: 16 }}>
                    <Title level={5}>Yêu cầu định dạng file:</Title>
                    <ul>
                      <li>
                        <strong>Các cột bắt buộc:</strong> Email, FullName,
                        Password, Role
                      </li>
                      <li>
                        <strong>Các cột tùy chọn cho sinh viên:</strong>{" "}
                        StudentCode, EnrollmentDate
                      </li>
                      <li>
                        <strong>Cột bắt buộc cho sinh viên:</strong>{" "}
                        CurriculumCode (hoặc CurriculumId) để ánh xạ sinh viên
                        với khung chương trình hiện có
                      </li>
                      <li>
                        <strong>Các cột tùy chọn cho giảng viên:</strong>{" "}
                        TeacherCode, HireDate, Specialization, PhoneNumber
                      </li>
                      <li>
                        <strong>Giá trị vai trò:</strong> "Student" hoặc
                        "Teacher"
                      </li>
                      <li>
                        <strong>Định dạng ngày được hỗ trợ:</strong> YYYY-MM-DD,
                        MM/DD/YYYY, DD-MM-YYYY (ví dụ: 2024-01-15, 1/15/2024,
                        15-01-2024)
                      </li>
                      <li>
                        <strong>Định dạng số điện thoại được hỗ trợ:</strong>{" "}
                        Mọi định dạng đều hoạt động - 0944056171, +84944056171,
                        84944056171 (khoảng trắng và dấu gạch ngang sẽ bị xóa)
                      </li>
                    </ul>
                    <div style={{ display: "flex", gap: "16px" }}>
                      <Button
                        type="link"
                        onClick={() => {
                          // Download sample CSV template
                          const csvContent =
                            "Email,FullName,Password,Role,StudentCode,EnrollmentDate,TeacherCode,HireDate,Specialization,PhoneNumber,CurriculumCode\n" +
                            "student1@example.com,John Doe,password123,Student,SE001,2024-01-15,,,,0944056171,CURR-IT01\n" +
                            "teacher1@example.com,Jane Smith,password123,Teacher,,,TE001,2024-01-15,Computer Science,0123456789,";
                          const blob = new Blob([csvContent], {
                            type: "text/csv",
                          });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "bulk_register_template.csv";
                          a.click();
                          window.URL.revokeObjectURL(url);
                          message.success("Đã tải xuống mẫu CSV!");
                        }}
                      >
                        Tải mẫu CSV
                      </Button>
                      <Button
                        type="link"
                        onClick={() => {
                          // Create Excel template
                          const wb = XLSX.utils.book_new();

                          // Create header and sample data
                          const wsData = [
                            [
                              "Email",
                              "FullName",
                              "Password",
                              "Role",
                              "StudentCode",
                              "EnrollmentDate",
                              "TeacherCode",
                              "HireDate",
                              "Specialization",
                              "PhoneNumber",
                              "CurriculumCode",
                            ],
                            [
                              "student1@example.com",
                              "John Doe",
                              "password123",
                              "Student",
                              "SE001",
                              "2024-01-15",
                              "",
                              "",
                              "",
                              "0944056171",
                              "CURR-IT01",
                            ],
                            [
                              "teacher1@example.com",
                              "Jane Smith",
                              "password123",
                              "Teacher",
                              "",
                              "",
                              "TE001",
                              "2024-01-15",
                              "Computer Science",
                              "0944036171",
                              "",
                            ],
                          ];

                          const ws = XLSX.utils.aoa_to_sheet(wsData);

                          // Set column widths
                          ws["!cols"] = [
                            { wch: 25 }, // Email
                            { wch: 20 }, // FullName
                            { wch: 15 }, // Password
                            { wch: 10 }, // Role
                            { wch: 12 }, // StudentCode
                            { wch: 15 }, // EnrollmentDate
                            { wch: 12 }, // TeacherCode
                            { wch: 15 }, // HireDate
                            { wch: 20 }, // Specialization
                            { wch: 15 }, // PhoneNumber
                            { wch: 18 }, // CurriculumCode
                          ];

                          XLSX.utils.book_append_sheet(wb, ws, "Users");

                          // Generate Excel file
                          XLSX.writeFile(wb, "bulk_register_template.xlsx");
                          message.success("Đã tải xuống mẫu Excel!");
                        }}
                      >
                        Tải mẫu Excel
                      </Button>
                    </div>
                  </Card>

                  <Upload.Dragger
                    name="file"
                    accept=".csv,.xlsx,.xls"
                    maxCount={1}
                    beforeUpload={(file) => {
                      const isValidType =
                        file.type === "text/csv" ||
                        file.type === "application/vnd.ms-excel" ||
                        file.type ===
                          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

                      if (!isValidType) {
                        message.error("Vui lòng tải lên file CSV hoặc Excel!");
                        return Upload.LIST_IGNORE;
                      }

                      const reader = new FileReader();

                      // Check if file is Excel or CSV
                      const isExcel =
                        file.name.endsWith(".xlsx") ||
                        file.name.endsWith(".xls");

                      if (isExcel) {
                        // Handle Excel files
                        reader.onload = (e) => {
                          try {
                            const data = new Uint8Array(
                              e.target?.result as ArrayBuffer
                            );
                            const workbook = XLSX.read(data, { type: "array" });
                            const firstSheet =
                              workbook.Sheets[workbook.SheetNames[0]];
                            const jsonData = XLSX.utils.sheet_to_json(
                              firstSheet,
                              {
                                header: 1,
                                raw: false,
                                dateNF: "yyyy-mm-dd",
                              }
                            ) as any[][];

                            const headers = jsonData[0] as string[];
                            const importedUsers: UserFormData[] = [];

                            for (let i = 1; i < jsonData.length; i++) {
                              const row = jsonData[i];
                              if (!row || row.length === 0) continue;

                              const user: any = {};
                              headers.forEach((header, index) => {
                                if (
                                  row[index] !== undefined &&
                                  row[index] !== null &&
                                  row[index] !== ""
                                ) {
                                  user[header.trim()] = row[index];
                                }
                              });

                              if (
                                user.Email &&
                                user.FullName &&
                                user.Password &&
                                user.Role
                              ) {
                                const newUser: UserFormData = {
                                  email: String(user.Email).trim(),
                                  fullName: String(user.FullName).trim(),
                                  password: String(user.Password).trim(),
                                  roleName: String(user.Role).trim() as
                                    | "Student"
                                    | "Teacher",
                                  key: `user-${Date.now()}-${Math.random()}-${i}`,
                                };

                                if (user.Role === "Student") {
                                  if (user.StudentCode)
                                    newUser.studentCode = String(
                                      user.StudentCode
                                    ).trim();
                                  if (user.EnrollmentDate) {
                                    const dateValue = user.EnrollmentDate;
                                    let parsedDate: Date | null = null;

                                    // Check if it's a number (Excel serial date)
                                    if (
                                      typeof dateValue === "number" ||
                                      !isNaN(Number(dateValue))
                                    ) {
                                      // Excel date: days since 1900-01-01 (with 1900 leap year bug)
                                      const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
                                      parsedDate = new Date(
                                        excelEpoch.getTime() +
                                          Number(dateValue) * 86400000
                                      );
                                    } else {
                                      // String date formats
                                      const dateStr = String(dateValue).trim();

                                      if (
                                        dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)
                                      ) {
                                        parsedDate = new Date(dateStr);
                                      } else if (
                                        dateStr.match(
                                          /^\d{1,2}\/\d{1,2}\/\d{4}$/
                                        )
                                      ) {
                                        parsedDate = new Date(dateStr);
                                      } else if (
                                        dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)
                                      ) {
                                        const parts = dateStr.split("-");
                                        parsedDate = new Date(
                                          `${parts[2]}-${parts[1]}-${parts[0]}`
                                        );
                                      }
                                    }

                                    if (
                                      parsedDate &&
                                      !isNaN(parsedDate.getTime())
                                    ) {
                                      newUser.enrollmentDate =
                                        parsedDate.toISOString();
                                    }
                                  }
                                  const curriculumValue =
                                    pickCurriculumValue(user);
                                  const resolvedCurriculumId =
                                    resolveCurriculumId(curriculumValue);
                                  if (resolvedCurriculumId) {
                                    newUser.curriculumId = resolvedCurriculumId;
                                  }
                                  // Handle phone number for Student too
                                  if (user.PhoneNumber) {
                                    let phone = String(user.PhoneNumber).trim();

                                    if (phone.startsWith("'")) {
                                      phone = phone.substring(1);
                                    }

                                    if (
                                      phone.includes("E") ||
                                      phone.includes("e")
                                    ) {
                                      phone = Number(phone).toFixed(0);
                                    }

                                    phone = phone.replace(/[\s\-()]/g, "");
                                    phone = phone.replace(/[^\d+]/g, "");

                                    if (phone.length >= 10) {
                                      newUser.phoneNumber = phone;
                                    }
                                  }
                                } else if (user.Role === "Teacher") {
                                  if (user.TeacherCode)
                                    newUser.teacherCode = String(
                                      user.TeacherCode
                                    ).trim();
                                  if (user.HireDate) {
                                    const dateValue = user.HireDate;
                                    let parsedDate: Date | null = null;

                                    // Check if it's a number (Excel serial date)
                                    if (
                                      typeof dateValue === "number" ||
                                      !isNaN(Number(dateValue))
                                    ) {
                                      // Excel date: days since 1900-01-01 (with 1900 leap year bug)
                                      const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899
                                      parsedDate = new Date(
                                        excelEpoch.getTime() +
                                          Number(dateValue) * 86400000
                                      );
                                    } else {
                                      // String date formats
                                      const dateStr = String(dateValue).trim();

                                      if (
                                        dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)
                                      ) {
                                        parsedDate = new Date(dateStr);
                                      } else if (
                                        dateStr.match(
                                          /^\d{1,2}\/\d{1,2}\/\d{4}$/
                                        )
                                      ) {
                                        parsedDate = new Date(dateStr);
                                      } else if (
                                        dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)
                                      ) {
                                        const parts = dateStr.split("-");
                                        parsedDate = new Date(
                                          `${parts[2]}-${parts[1]}-${parts[0]}`
                                        );
                                      }
                                    }

                                    if (
                                      parsedDate &&
                                      !isNaN(parsedDate.getTime())
                                    ) {
                                      newUser.hireDate =
                                        parsedDate.toISOString();
                                    }
                                  }
                                  if (user.Specialization)
                                    newUser.specialization = String(
                                      user.Specialization
                                    ).trim();
                                  if (user.PhoneNumber) {
                                    let phone = String(user.PhoneNumber).trim();

                                    if (phone.startsWith("'")) {
                                      phone = phone.substring(1);
                                    }

                                    if (
                                      phone.includes("E") ||
                                      phone.includes("e")
                                    ) {
                                      phone = Number(phone).toFixed(0);
                                    }

                                    phone = phone.replace(/[\s\-()]/g, "");
                                    phone = phone.replace(/[^\d+]/g, "");

                                    if (phone.length >= 10) {
                                      newUser.phoneNumber = phone;
                                    }
                                  }
                                }

                                importedUsers.push(newUser);
                              }
                            }

                            if (importedUsers.length > 0) {
                              setUsers([...users, ...importedUsers]);
                              message.success(
                                `Đã nhập thành công ${importedUsers.length} người dùng từ file Excel!`
                              );
                            } else {
                              message.warning(
                                "Không tìm thấy người dùng hợp lệ trong file Excel!"
                              );
                            }
                          } catch (error) {
                            message.error(
                              "Không thể phân tích file Excel. Vui lòng kiểm tra định dạng!"
                            );
                            console.error("Excel parse error:", error);
                          }
                        };

                        reader.readAsArrayBuffer(file);
                      } else {
                        // Handle CSV files
                        reader.onload = (e) => {
                          try {
                            const text = e.target?.result as string;
                            const lines = text.split("\n");
                            const headers = lines[0]
                              .split(",")
                              .map((h) => h.trim());

                            const importedUsers: UserFormData[] = [];

                            for (let i = 1; i < lines.length; i++) {
                              if (!lines[i].trim()) continue;

                              const values = lines[i]
                                .split(",")
                                .map((v) => v.trim());
                              const user: any = {};

                              headers.forEach((header, index) => {
                                if (values[index]) {
                                  user[header] = values[index];
                                }
                              });

                              if (
                                user.Email &&
                                user.FullName &&
                                user.Password &&
                                user.Role
                              ) {
                                const newUser: UserFormData = {
                                  email: user.Email,
                                  fullName: user.FullName,
                                  password: user.Password,
                                  roleName: user.Role as "Student" | "Teacher",
                                  key: `user-${Date.now()}-${Math.random()}-${i}`,
                                };

                                if (user.Role === "Student") {
                                  if (user.StudentCode)
                                    newUser.studentCode = user.StudentCode;
                                  if (user.EnrollmentDate) {
                                    // Handle multiple date formats
                                    const dateStr = String(
                                      user.EnrollmentDate
                                    ).trim();
                                    let parsedDate: Date | null = null;

                                    // Try YYYY-MM-DD format
                                    if (
                                      dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)
                                    ) {
                                      parsedDate = new Date(dateStr);
                                    }
                                    // Try MM/DD/YYYY or M/D/YYYY format
                                    else if (
                                      dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
                                    ) {
                                      parsedDate = new Date(dateStr);
                                    }
                                    // Try DD-MM-YYYY format
                                    else if (
                                      dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)
                                    ) {
                                      const parts = dateStr.split("-");
                                      parsedDate = new Date(
                                        `${parts[2]}-${parts[1]}-${parts[0]}`
                                      );
                                    }

                                    if (
                                      parsedDate &&
                                      !isNaN(parsedDate.getTime())
                                    ) {
                                      newUser.enrollmentDate =
                                        parsedDate.toISOString();
                                    }
                                  }
                                  const curriculumValue =
                                    pickCurriculumValue(user);
                                  const resolvedCurriculumId =
                                    resolveCurriculumId(curriculumValue);
                                  if (resolvedCurriculumId) {
                                    newUser.curriculumId = resolvedCurriculumId;
                                  }
                                  // Handle phone number for Student
                                  if (user.PhoneNumber) {
                                    let phone = String(user.PhoneNumber).trim();

                                    if (phone.startsWith("'")) {
                                      phone = phone.substring(1);
                                    }

                                    if (
                                      phone.includes("E") ||
                                      phone.includes("e")
                                    ) {
                                      phone = Number(phone).toFixed(0);
                                    }

                                    phone = phone.replace(/[\s\-()]/g, "");
                                    phone = phone.replace(/[^\d+]/g, "");

                                    if (phone.length >= 10) {
                                      newUser.phoneNumber = phone;
                                    }
                                  }
                                } else if (user.Role === "Teacher") {
                                  if (user.TeacherCode)
                                    newUser.teacherCode = user.TeacherCode;
                                  if (user.HireDate) {
                                    // Handle multiple date formats
                                    const dateStr = String(
                                      user.HireDate
                                    ).trim();
                                    let parsedDate: Date | null = null;

                                    if (
                                      dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)
                                    ) {
                                      parsedDate = new Date(dateStr);
                                    } else if (
                                      dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)
                                    ) {
                                      parsedDate = new Date(dateStr);
                                    } else if (
                                      dateStr.match(/^\d{1,2}-\d{1,2}-\d{4}$/)
                                    ) {
                                      const parts = dateStr.split("-");
                                      parsedDate = new Date(
                                        `${parts[2]}-${parts[1]}-${parts[0]}`
                                      );
                                    }

                                    if (
                                      parsedDate &&
                                      !isNaN(parsedDate.getTime())
                                    ) {
                                      newUser.hireDate =
                                        parsedDate.toISOString();
                                    }
                                  }
                                  if (user.Specialization)
                                    newUser.specialization =
                                      user.Specialization;
                                  if (user.PhoneNumber) {
                                    // Clean phone number
                                    let phone = String(user.PhoneNumber).trim();

                                    // Remove leading apostrophe if exists (Excel text format marker)
                                    if (phone.startsWith("'")) {
                                      phone = phone.substring(1);
                                    }

                                    // Handle scientific notation (e.g., 8.4123456789E+10)
                                    if (
                                      phone.includes("E") ||
                                      phone.includes("e")
                                    ) {
                                      phone = Number(phone).toFixed(0);
                                    }

                                    // Remove all spaces, dashes, parentheses
                                    phone = phone.replace(/[\s\-()]/g, "");

                                    // Keep only digits and leading +
                                    phone = phone.replace(/[^\d+]/g, "");

                                    // Save as-is if valid length
                                    if (phone.length >= 10) {
                                      newUser.phoneNumber = phone;
                                    }
                                  }
                                }

                                importedUsers.push(newUser);
                              }
                            }

                            if (importedUsers.length > 0) {
                              setUsers([...users, ...importedUsers]);
                              message.success(
                                `Đã nhập thành công ${importedUsers.length} người dùng!`
                              );
                            } else {
                              message.warning(
                                "Không tìm thấy người dùng hợp lệ trong file!"
                              );
                            }
                          } catch (error) {
                            message.error(
                              "Không thể phân tích file. Vui lòng kiểm tra định dạng!"
                            );
                            console.error("CSV parse error:", error);
                          }
                        };

                        reader.readAsText(file);
                      }

                      return false; // Prevent auto upload
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <SaveOutlined
                        style={{ fontSize: 48, color: "#1890ff" }}
                      />
                    </p>
                    <p className="ant-upload-text">
                      Nhấp hoặc kéo thả file CSV/Excel vào đây
                    </p>
                    <p className="ant-upload-hint">
                      Hỗ trợ file CSV (.csv) và Excel (.xlsx, .xls). File sẽ
                      được phân tích và người dùng sẽ được thêm vào danh sách
                      bên dưới.
                    </p>
                  </Upload.Dragger>

                  <Divider>
                    Danh sách người dùng đã nhập ({users.length})
                  </Divider>

                  <Table
                    dataSource={users}
                    columns={userColumns}
                    pagination={{ pageSize: 10 }}
                    size="small"
                    rowKey={(r) => r.key!}
                    scroll={{ x: 1400 }}
                  />

                  <div
                    style={{
                      marginTop: 16,
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {users.length > 0 && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                          setUsers([]);
                          message.success("Cleared all users from list");
                        }}
                        block
                      >
                        Xóa tất cả
                      </Button>
                    )}
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleBulkRegister}
                      loading={isLoading}
                      disabled={users.length === 0}
                      block
                      size="large"
                    >
                      Đăng ký tất cả ({users.length} người dùng)
                    </Button>
                  </div>
                </>
              ),
            },
          ]}
        />

        {result && (
          <div style={{ marginTop: 24 }}>
            <Divider>Kết quả</Divider>
            <Alert
              message={`Tổng: ${result.statistics.total} | Thành công: ${result.statistics.success} | Thất bại: ${result.statistics.failed}`}
              type={result.statistics.failed === 0 ? "success" : "warning"}
              style={{ marginBottom: 16 }}
            />
            <Table
              dataSource={result.results}
              columns={resultColumns}
              pagination={{ pageSize: 10 }}
              rowKey={(record, index) => `${record.email}-${index}`}
              scroll={{ x: 1550 }}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default BulkRegister;
