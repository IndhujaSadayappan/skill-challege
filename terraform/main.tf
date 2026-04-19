provider "aws" {
  region = "ap-south-1" # Mumbai region, change as per preference
}

# 1. Create VPC
resource "aws_vpc" "skill_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = "skill-challenge-vpc"
  }
}

# 2. Create Internet Gateway
resource "aws_internet_gateway" "skill_igw" {
  vpc_id = aws_vpc.skill_vpc.id
  tags = {
    Name = "skill-challenge-igw"
  }
}

# 3. Create Public Subnet
resource "aws_subnet" "skill_subnet" {
  vpc_id                  = aws_vpc.skill_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "ap-south-1a"
  tags = {
    Name = "skill-challenge-subnet"
  }
}

# 4. Create Route Table
resource "aws_route_table" "skill_rt" {
  vpc_id = aws_vpc.skill_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.skill_igw.id
  }

  tags = {
    Name = "skill-challenge-rt"
  }
}

# 5. Associate Route Table with Subnet
resource "aws_route_table_association" "skill_rta" {
  subnet_id      = aws_subnet.skill_subnet.id
  route_table_id = aws_route_table.skill_rt.id
}

# 6. Create Security Group
resource "aws_security_group" "skill_sg" {
  name        = "skill-challenge-sg"
  description = "Allow web traffic"
  vpc_id      = aws_vpc.skill_vpc.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Frontend"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Backend"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Application Port 3000"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "skill-challenge-sg"
  }
}

# 7. Create EC2 Instance
resource "aws_instance" "skill_app" {
  ami           = "ami-007020fd9c84e18c7" # Ubuntu 22.04 LTS in ap-south-1
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.skill_subnet.id
  vpc_security_group_ids = [aws_security_group.skill_sg.id]
  key_name      = "my-aws-key" # MAKE SURE THIS KEY EXISTS IN YOUR AWS CONSOLE

  user_data = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y docker.io docker-compose
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              EOF

  tags = {
    Name = "skill-challenge-instance"
  }
}

# Outputs
output "public_ip" {
  value = aws_instance.skill_app.public_ip
}

output "public_url" {
  value = "http://${aws_instance.skill_app.public_ip}:3000"
}
