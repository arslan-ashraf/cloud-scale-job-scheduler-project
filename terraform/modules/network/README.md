# Network Module

This module creates a vpc and an arbitrary number of public and private subnets.

Example usage:

```
# module name can be anything, here we choose my_network_module

provider "aws" {
  region = "us-east-1"
  alias  = "us_east_1"
}

module "my_network_module" {
	source = "./modules/network"

	providers = {
		aws = aws.us_east_1
	}

	environment = "Developement"

	vpc_config = {
	  cidr_block = "10.0.0.0/16"
	  name = "example_vpc"
	}

	subnet_config = {
	  subnet_a = {
	    cidr_block = "10.0.1.0/24"
	    public     = true
	    AZ         = "us-east-1a"
	  }
	  subnet_b = {
	    cidr_block = "10.0.2.0/24"
	    public     = false
	    AZ         = "us-east-1b"
	  }
	  subnet_c = {
	    cidr_block = "10.0.3.0/24"
	    public     = true
	    AZ         = "us-east-1c"
	  }
	}
}
```