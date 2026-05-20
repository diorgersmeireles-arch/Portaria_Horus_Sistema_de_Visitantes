from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from enum import Enum
import uuid
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/horus")

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============ ENUMS ============
class UserRole(str, Enum):
    ADMIN = "admin"
    DIRECTOR = "director"
    PORTEIRO = "porteiro"
    RESPONSABLE = "responsable"

class VisitorType(str, Enum):
    VISITANTE = "visitante"
    FORNECEDOR = "fornecedor"
    PRESTADOR = "prestador_servico"

class VisitStatus(str, Enum):
    CHECKED_IN = "checked_in"
    CHECKED_OUT = "checked_out"
    CANCELLED = "cancelled"

class GateName(str, Enum):
    PRINCIPAL = "principal"
    SECUNDARIA = "secundaria"
    CANTINA = "cantina"
    ESTACIONAMENTO = "estacionamento"

# ============ MODELS ============

class Tenant(Base):
    """Multi-tenant: cada escola/cliente é um tenant"""
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    cnpj = Column(String(20), unique=True)
    is_active = Column(Boolean, default=True)
    settings = Column(String(JSON))  # JSON com configurações: base_class_time, etc.
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    users = relationship("User", back_populates="tenant")
    students = relationship("Student", back_populates="tenant")
    visitors = relationship("Visitor", back_populates="tenant")
    gates = relationship("Gate", back_populates="tenant")

class User(Base):
    """Usuários do sistema (portarias, diretores, etc)"""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(200), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.PORTEIRO)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    tenant = relationship("Tenant", back_populates="users")

class Gate(Base):
    """Pontos de acesso/portarias"""
    __tablename__ = "gates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    name = Column(SQLEnum(GateName), nullable=False)
    description = Column(String(200))
    is_active = Column(Boolean, default=True)
    requires_photo = Column(Boolean, default=True)

    tenant = relationship("Tenant", back_populates="gates")
    logs = relationship("AccessLog", back_populates="gate")

class Student(Base):
    """Alunos"""
    __tablename__ = "students"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    matricula = Column(String(50), nullable=False)
    full_name = Column(String(200), nullable=False)
    class_name = Column(String(100))
    birth_date = Column(DateTime)
    photo_url = Column(String(500))
    can_leave_alone = Column(Boolean, default=False)  # Autorizado a sair sozinho
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    tenant = relationship("Tenant", back_populates="students")
    arrivals = relationship("StudentArrival", back_populates="student")
    responsables = relationship("Responsable", back_populates="student", secondary="student_responsables")
    blocked_records = relationship("BlockedRecord", back_populates="student")

class Responsable(Base):
    """Responsáveis legais dos alunos"""
    __tablename__ = "responsables"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    full_name = Column(String(200), nullable=False)
    cpf = Column(String(20))
    phone = Column(String(20), nullable=False)
    email = Column(String(255))
    receives_notifications = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    tenant = relationship("Tenant")
    students = relationship("Student", back_populates="responsables", secondary="student_responsables")

class StudentResponsable(Base):
    """Relação N:N entre Student e Responsable"""
    __tablename__ = "student_responsables"

    student_id = Column(String, ForeignKey("students.id"), primary_key=True)
    responsable_id = Column(String, ForeignKey("responsables.id"), primary_key=True)
    kinship = Column(String(50))  # pai, mãe, avó, etc.

class Visitor(Base):
    """Visitantes, fornecedores, prestadores de serviço"""
    __tablename__ = "visitors"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    full_name = Column(String(200), nullable=False)
    cpf = Column(String(20))
    rg = Column(String(20))
    phone = Column(String(20))
    company = Column(String(200))
    visitor_type = Column(SQLEnum(VisitorType), nullable=False, default=VisitorType.VISITANTE)
    is_blocked = Column(Boolean, default=False)
    block_reason = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())

    tenant = relationship("Tenant", back_populates="visitors")
    visits = relationship("VisitEvent", back_populates="visitor")

class VisitEvent(Base):
    """Registro de visita (check-in/check-out)"""
    __tablename__ = "visit_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    visitor_id = Column(String, ForeignKey("visitors.id"), nullable=False)
    gate_id = Column(String, ForeignKey("gates.id"))
    checked_in_by = Column(String, ForeignKey("users.id"))
    checked_out_by = Column(String, ForeignKey("users.id"))
    reason = Column(String(500))  # Motivo da visita
    department = Column(String(200))  # Departamento/responsável a ser visitado
    expected_duration = Column(Integer)  # Minutos estimados
    check_in = Column(DateTime, nullable=False, server_default=func.now())
    check_out = Column(DateTime)
    status = Column(SQLEnum(VisitStatus), default=VisitStatus.CHECKED_IN)
    photo_url = Column(String(500))  # URL da foto no S3/Storage
    check_in_photo_url = Column(String(500))
    check_out_photo_url = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())

    visitor = relationship("Visitor", back_populates="visits")
    gate = relationship("Gate", back_populates="logs")

class StudentArrival(Base):
    """Registro de chegada de aluno"""
    __tablename__ = "student_arrivals"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    gate_id = Column(String, ForeignKey("gates.id"))
    arrived_by = Column(String, ForeignKey("users.id"))
    arrived_at = Column(DateTime, nullable=False, server_default=func.now())
    is_late = Column(Boolean, default=False)
    late_minutes = Column(Integer, default=0)
    left_early = Column(Boolean, default=False)
    left_early_minutes = Column(Integer, default=0)
    notes = Column(String(500))

    student = relationship("Student", back_populates="arrivals")

class BlockedRecord(Base):
    """Pessoas bloqueadas (alunos, visitantes não autorizados)"""
    __tablename__ = "blocked_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    student_id = Column(String, ForeignKey("students.id"), nullable=True)
    visitor_id = Column(String, ForeignKey("visitors.id"), nullable=True)
    blocked_by = Column(String, ForeignKey("users.id"))
    reason = Column(String(500), nullable=False)
    blocked_at = Column(DateTime, server_default=func.now())
    expires_at = Column(DateTime, nullable=True)  # Se None, é permanente

    tenant = relationship("Tenant")
    student = relationship("Student", back_populates="blocked_records")

class AccessLog(Base):
    """Logs de auditoria - quem acessou/fez o quê"""
    __tablename__ = "access_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    gate_id = Column(String, ForeignKey("gates.id"))
    action = Column(String(100), nullable=False)  # CHECK_IN, CHECK_OUT, BLOCK, UNBLOCK, etc.
    target_type = Column(String(50))  # visitor, student, user
    target_id = Column(String)
    details = Column(String(1000))  # JSON com detalhes da ação
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    created_at = Column(DateTime, server_default=func.now())

    tenant = relationship("Tenant")
    user = relationship("User")
    gate = relationship("Gate", back_populates="logs")

# ============ INIT DB ============
def init_db():
    Base.metadata.create_all(bind=engine)