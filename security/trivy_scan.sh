#!/bin/bash
echo "Running Trivy scan on local images..."
trivy image backend
trivy image frontend
